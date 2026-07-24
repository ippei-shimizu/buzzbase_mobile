import type {
  MediaAttachment,
  MediaType,
  StagedMediaAsset,
} from "../../types/mediaAttachment";
import { Ionicons } from "@expo/vector-icons";
import { isAxiosError } from "axios";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { PaywallModal } from "@components/pro/PaywallModal";
import { useEntitlement } from "@hooks/useEntitlement";
import { useMediaAttachmentUpload } from "@hooks/useMediaAttachmentUpload";
import { useVideoTrim } from "@hooks/useVideoTrim";
import {
  FREE_MEDIA_MONTHLY_LIMIT,
  FREE_VIDEO_MAX_DURATION_SECONDS,
  PRO_VIDEO_MAX_DURATION_SECONDS,
} from "@utils/mediaLimits";
import { generateVideoThumbnail, getVideoMeta } from "@utils/mediaProcessing";

/** サムネイル生成に失敗しても選択自体は継続させるため、失敗時はnullにフォールバックする。 */
const generateVideoPreview = async (uri: string): Promise<string | null> => {
  try {
    return await generateVideoThumbnail(uri);
  } catch {
    return null;
  }
};

interface Props {
  /** 保存済みノートのID。指定時は選択後すぐにアップロードする。 */
  baseballNoteId?: number;
  /**
   * baseballNoteIdが未確定（ノート新規作成中）の場合、選択したメディアを
   * アップロードせずローカルで保持してもらうためのコールバック。
   */
  onStage?: (asset: StagedMediaAsset) => void;
  onUploaded?: (attachment: MediaAttachment) => void;
}

const PHASE_LABEL: Record<string, string> = {
  compressing: "圧縮中…",
  uploading: "アップロード中…",
  finalizing: "仕上げ中…",
};

const guessContentType = (
  asset: ImagePicker.ImagePickerAsset,
  mediaType: MediaType,
): string =>
  asset.mimeType ?? (mediaType === "video" ? "video/mp4" : "image/jpeg");

/** 上限を超えていないか確認し、任意でトリミングするか選ばせる確認ダイアログ。 */
const confirmOptionalTrim = (): Promise<boolean> =>
  new Promise((resolve) => {
    Alert.alert(
      "動画を編集しますか？",
      "そのまま追加するか、トリミングしてから追加できます。",
      [
        {
          text: "そのまま追加",
          style: "cancel",
          onPress: () => resolve(false),
        },
        { text: "トリミングする", onPress: () => resolve(true) },
      ],
    );
  });

/** ノートへの画像・動画添付。撮影/ライブラリから選択し、圧縮〜アップロードまで完結させる。 */
export function MediaPicker({ baseballNoteId, onStage, onUploaded }: Props) {
  const { upload, phase, reset } = useMediaAttachmentUpload();
  const { trim, isTrimming } = useVideoTrim();
  const { hasEntitlement } = useEntitlement();
  const [isPaywallOpen, setPaywallOpen] = useState(false);

  const isBusy =
    isTrimming ||
    phase === "compressing" ||
    phase === "uploading" ||
    phase === "finalizing";

  const videoDurationLimitSeconds = () =>
    hasEntitlement("unlimited_media_uploads")
      ? PRO_VIDEO_MAX_DURATION_SECONDS
      : FREE_VIDEO_MAX_DURATION_SECONDS;

  /**
   * 動画が上限を超えていれば強制的にトリミング画面を開く（キャンセルしたら選択自体を
   * 中断しnullを返す）。上限内でも任意でトリミングするか確認する。
   * @returns 最終的に使用する動画URI。中断すべき場合はnull
   */
  const resolveVideoUri = async (rawUri: string): Promise<string | null> => {
    const limitSeconds = videoDurationLimitSeconds();

    let rawDurationSeconds = 0;
    try {
      rawDurationSeconds = (await getVideoMeta(rawUri)).durationSeconds;
    } catch {
      // メタ取得に失敗した場合はトリミング判定をスキップしそのまま進める。
      return rawUri;
    }

    if (rawDurationSeconds > limitSeconds) {
      const result = await trim(rawUri, limitSeconds);
      return result?.uri ?? null;
    }

    const shouldTrim = await confirmOptionalTrim();
    if (!shouldTrim) return rawUri;

    const result = await trim(rawUri, limitSeconds);
    return result?.uri ?? rawUri;
  };

  const handlePick = async (source: "library" | "camera") => {
    const permission =
      source === "library"
        ? await ImagePicker.requestMediaLibraryPermissionsAsync()
        : await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("権限が必要です", "設定からアクセスを許可してください");
      return;
    }

    const launch =
      source === "library"
        ? ImagePicker.launchImageLibraryAsync
        : ImagePicker.launchCameraAsync;
    let result: ImagePicker.ImagePickerResult;
    try {
      result = await launch({ mediaTypes: ["images", "videos"], quality: 0.8 });
    } catch {
      // シミュレータでの撮影等、ハードウェア起因で起動自体に失敗するケースがある。
      Alert.alert("起動できませんでした", "カメラ・ライブラリを利用できません");
      return;
    }
    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    const mediaType: MediaType = asset.type === "video" ? "video" : "image";
    const contentType = guessContentType(asset, mediaType);

    let uri = asset.uri;
    if (mediaType === "video") {
      const resolvedUri = await resolveVideoUri(asset.uri);
      if (resolvedUri == null) return; // 上限超過でユーザーがトリミングをキャンセル
      uri = resolvedUri;
    }

    if (baseballNoteId == null) {
      // ノート未保存時は選択のみ。アップロードは保存後にまとめて行う。
      const previewUri =
        mediaType === "video" ? await generateVideoPreview(uri) : uri;
      onStage?.({
        localId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        uri,
        mediaType,
        contentType,
        previewUri,
        memo: "",
      });
      return;
    }

    try {
      const attachment = await upload(
        { uri, mediaType, contentType },
        baseballNoteId,
      );
      onUploaded?.(attachment);
      reset();
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 403) {
        setPaywallOpen(true);
      } else {
        Alert.alert("アップロードに失敗しました");
      }
      reset();
    }
  };

  return (
    <View>
      <View style={styles.row}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => handlePick("camera")}
          disabled={isBusy}
        >
          <Ionicons name="camera-outline" size={20} color="#d08000" />
          <Text style={styles.buttonText}>撮影</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => handlePick("library")}
          disabled={isBusy}
        >
          <Ionicons name="images-outline" size={20} color="#d08000" />
          <Text style={styles.buttonText}>ライブラリ</Text>
        </TouchableOpacity>
      </View>
      {isBusy ? (
        <View style={styles.progressRow}>
          <ActivityIndicator size="small" color="#d08000" />
          <Text style={styles.progressText}>
            {isTrimming ? "トリミング中…" : PHASE_LABEL[phase]}
          </Text>
        </View>
      ) : null}
      <PaywallModal
        isOpen={isPaywallOpen}
        onClose={() => setPaywallOpen(false)}
        feature="unlimited_media_uploads"
        contextMessage={`今月の無料上限（${FREE_MEDIA_MONTHLY_LIMIT}件）に達したため、保存できませんでした。`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 8 },
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#3A3A3A",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  buttonText: { color: "#F4F4F4", fontSize: 14 },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  progressText: { color: "#A1A1AA", fontSize: 13 },
});

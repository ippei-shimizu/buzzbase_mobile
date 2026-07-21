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
import { useMediaAttachmentUpload } from "@hooks/useMediaAttachmentUpload";

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
  compressing: "動画を圧縮中…",
  uploading: "アップロード中…",
  finalizing: "仕上げ中…",
};

const guessContentType = (
  asset: ImagePicker.ImagePickerAsset,
  mediaType: MediaType,
): string =>
  asset.mimeType ?? (mediaType === "video" ? "video/mp4" : "image/jpeg");

/** ノートへの画像・動画添付。撮影/ライブラリから選択し、圧縮〜アップロードまで完結させる。 */
export function MediaPicker({ baseballNoteId, onStage, onUploaded }: Props) {
  const { upload, phase, reset } = useMediaAttachmentUpload();
  const [isPaywallOpen, setPaywallOpen] = useState(false);

  const isBusy =
    phase === "compressing" || phase === "uploading" || phase === "finalizing";

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
    const result = await launch({
      mediaTypes: ["images", "videos"],
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    const mediaType: MediaType = asset.type === "video" ? "video" : "image";
    const contentType = guessContentType(asset, mediaType);

    if (baseballNoteId == null) {
      // ノート未保存時は選択のみ。アップロードは保存後にまとめて行う。
      onStage?.({
        localId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        uri: asset.uri,
        mediaType,
        contentType,
        previewUri: mediaType === "image" ? asset.uri : null,
        memo: "",
      });
      return;
    }

    try {
      const attachment = await upload(
        { uri: asset.uri, mediaType, contentType },
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
          <Text style={styles.progressText}>{PHASE_LABEL[phase]}</Text>
        </View>
      ) : null}
      <PaywallModal
        isOpen={isPaywallOpen}
        onClose={() => setPaywallOpen(false)}
        feature="unlimited_media_uploads"
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

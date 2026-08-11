import type { StagedMediaAsset } from "../../types/mediaAttachment";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Icon } from "@components/icon/Icon";
import { useEntitlement } from "@hooks/useEntitlement";
import { useVideoTrim } from "@hooks/useVideoTrim";
import {
  FREE_VIDEO_MAX_DURATION_SECONDS,
  PRO_VIDEO_MAX_DURATION_SECONDS,
} from "@utils/mediaLimits";
import { buildMediaMemoLabel } from "@utils/mediaMemoLabel";
import { generateVideoThumbnail } from "@utils/mediaProcessing";
import { MediaViewer } from "./MediaViewer";

interface Props {
  assets: StagedMediaAsset[];
  onRemove: (localId: string) => void;
  onUpdateMemo: (localId: string, memo: string) => void;
  onUpdateUri: (
    localId: string,
    uri: string,
    previewUri: string | null,
  ) => void;
}

/** サムネイル生成に失敗しても再トリミング自体は継続させるため、失敗時はnullにフォールバックする。 */
const generateVideoPreview = async (uri: string): Promise<string | null> => {
  try {
    return await generateVideoThumbnail(uri);
  } catch {
    return null;
  }
};

/**
 * ノート新規作成中、保存前に選択したメディアのプレビュー一覧（未アップロード）。
 * タップするとフルスクリーンでプレビューし、メモをその場で編集できる
 * （アップロードは保存後にまとめて行うが、メモはローカルに保持し完了通知で送信する）。
 * 動画は任意のタイミングで再トリミングできる（ローカルURIを差し替えるだけ）。
 */
export function StagedMediaList({
  assets,
  onRemove,
  onUpdateMemo,
  onUpdateUri,
}: Props) {
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [trimmingLocalId, setTrimmingLocalId] = useState<string | null>(null);
  const { trim, isTrimming } = useVideoTrim();
  const { hasEntitlement } = useEntitlement();

  if (assets.length === 0) return null;

  const viewing = assets.find((asset) => asset.localId === viewingId) ?? null;

  const handleTrim = async (asset: StagedMediaAsset) => {
    const limitSeconds = hasEntitlement("unlimited_media_uploads")
      ? PRO_VIDEO_MAX_DURATION_SECONDS
      : FREE_VIDEO_MAX_DURATION_SECONDS;
    setTrimmingLocalId(asset.localId);
    try {
      const result = await trim(asset.uri, limitSeconds);
      if (result) {
        const previewUri = await generateVideoPreview(result.uri);
        onUpdateUri(asset.localId, result.uri, previewUri);
      }
    } finally {
      setTrimmingLocalId(null);
    }
  };

  return (
    <View style={styles.grid}>
      {assets.map((asset) => (
        <View key={asset.localId} style={styles.thumbnailWrapper}>
          <TouchableOpacity onPress={() => setViewingId(asset.localId)}>
            {asset.previewUri ? (
              <Image
                source={{ uri: asset.previewUri }}
                style={styles.thumbnail}
                accessible
                accessibilityRole="image"
              />
            ) : (
              <View style={[styles.thumbnail, styles.videoPlaceholder]}>
                <Icon name="videocam" size={36} color="#A1A1AA" />
              </View>
            )}
            <View style={styles.memoLabel}>
              <Text style={styles.memoLabelText} numberOfLines={1}>
                {buildMediaMemoLabel(asset.mediaType, asset.memo)}
              </Text>
            </View>
            {trimmingLocalId === asset.localId ? (
              <View style={styles.trimmingOverlay}>
                <ActivityIndicator size="small" color="#F4F4F4" />
              </View>
            ) : null}
          </TouchableOpacity>
          {asset.mediaType === "video" ? (
            <TouchableOpacity
              style={styles.trimButton}
              disabled={isTrimming}
              onPress={() => handleTrim(asset)}
            >
              <Icon name="cut-outline" size={16} color="#F4F4F4" />
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            style={styles.removeButton}
            hitSlop={8}
            onPress={() => onRemove(asset.localId)}
          >
            <Icon name="close-circle" size={22} color="#F4F4F4" />
          </TouchableOpacity>
        </View>
      ))}
      <MediaViewer
        content={
          viewing
            ? {
                mediaType: viewing.mediaType,
                mediaUri: viewing.uri,
                memo: viewing.memo,
              }
            : null
        }
        onClose={() => setViewingId(null)}
        editableMemo
        onSaveMemo={(memo) => {
          if (viewing) onUpdateMemo(viewing.localId, memo);
          setViewingId(null);
        }}
      />
    </View>
  );
}

const THUMBNAIL_SIZE = 140;

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 8 },
  thumbnailWrapper: { position: "relative" },
  thumbnail: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
    borderRadius: 10,
    backgroundColor: "#3A3A3A",
  },
  videoPlaceholder: { justifyContent: "center", alignItems: "center" },
  memoLabel: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  memoLabelText: { color: "#F4F4F4", fontSize: 12, fontWeight: "600" },
  trimmingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  trimButton: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 14,
    padding: 5,
  },
  removeButton: {
    position: "absolute",
    top: -8,
    right: -8,
  },
});

import type { StagedMediaAsset } from "../../types/mediaAttachment";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { buildMediaMemoLabel } from "@utils/mediaMemoLabel";
import { MediaViewer } from "./MediaViewer";

interface Props {
  assets: StagedMediaAsset[];
  onRemove: (localId: string) => void;
  onUpdateMemo: (localId: string, memo: string) => void;
}

/**
 * ノート新規作成中、保存前に選択したメディアのプレビュー一覧（未アップロード）。
 * タップするとフルスクリーンでプレビューし、メモをその場で編集できる
 * （アップロードは保存後にまとめて行うが、メモはローカルに保持し完了通知で送信する）。
 */
export function StagedMediaList({ assets, onRemove, onUpdateMemo }: Props) {
  const [viewingId, setViewingId] = useState<string | null>(null);

  if (assets.length === 0) return null;

  const viewing = assets.find((asset) => asset.localId === viewingId) ?? null;

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
                <Ionicons name="videocam" size={36} color="#A1A1AA" />
              </View>
            )}
            <View style={styles.memoLabel}>
              <Text style={styles.memoLabelText} numberOfLines={1}>
                {buildMediaMemoLabel(asset.mediaType, asset.memo)}
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => onRemove(asset.localId)}
          >
            <Ionicons name="close-circle" size={22} color="#F4F4F4" />
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
  removeButton: {
    position: "absolute",
    top: -8,
    right: -8,
  },
});

import type { StagedMediaAsset } from "../../types/mediaAttachment";
import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";

interface Props {
  assets: StagedMediaAsset[];
  onRemove: (localId: string) => void;
}

/** ノート新規作成中、保存前に選択したメディアのプレビュー一覧（未アップロード）。 */
export function StagedMediaList({ assets, onRemove }: Props) {
  if (assets.length === 0) return null;

  return (
    <View style={styles.grid}>
      {assets.map((asset) => (
        <View key={asset.localId} style={styles.thumbnailWrapper}>
          {asset.previewUri ? (
            <Image
              source={{ uri: asset.previewUri }}
              style={styles.thumbnail}
              accessible
              accessibilityRole="image"
            />
          ) : (
            <View style={[styles.thumbnail, styles.videoPlaceholder]}>
              <Ionicons name="videocam" size={28} color="#A1A1AA" />
            </View>
          )}
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => onRemove(asset.localId)}
          >
            <Ionicons name="close-circle" size={20} color="#F4F4F4" />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

const THUMBNAIL_SIZE = 88;

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  thumbnailWrapper: { position: "relative" },
  thumbnail: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
    borderRadius: 8,
    backgroundColor: "#3A3A3A",
  },
  videoPlaceholder: { justifyContent: "center", alignItems: "center" },
  removeButton: {
    position: "absolute",
    top: -6,
    right: -6,
  },
});

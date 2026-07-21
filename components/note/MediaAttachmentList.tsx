import type { MediaAttachment } from "../../types/mediaAttachment";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useMediaAttachmentMutations } from "@hooks/useMediaAttachmentMutations";
import { MediaViewer } from "./MediaViewer";

interface Props {
  attachments: MediaAttachment[];
  /** 削除・メモ編集を可能にするか。ノート編集時はtrue、他ユーザーのノート閲覧時はfalse。 */
  editable?: boolean;
}

/** ノートに添付された画像・動画のサムネイルグリッド。タップでフルスクリーン再生+メモ編集。 */
export function MediaAttachmentList({ attachments, editable = false }: Props) {
  const {
    deleteMediaAttachment,
    isDeleting,
    updateMediaAttachmentMemo,
    isUpdatingMemo,
  } = useMediaAttachmentMutations();
  const [viewingId, setViewingId] = useState<number | null>(null);

  if (attachments.length === 0) return null;

  const viewing = attachments.find((item) => item.id === viewingId) ?? null;

  return (
    <View style={styles.grid}>
      {attachments.map((attachment) => (
        <View key={attachment.id} style={styles.thumbnailWrapper}>
          <TouchableOpacity
            onPress={() => setViewingId(attachment.id)}
            disabled={attachment.status === "pending"}
          >
            {attachment.status === "pending" ? (
              <View style={[styles.thumbnail, styles.processing]}>
                <ActivityIndicator size="small" color="#d08000" />
              </View>
            ) : (
              <Image
                source={{
                  uri:
                    attachment.thumbnail_url ??
                    attachment.playback_url ??
                    undefined,
                }}
                style={styles.thumbnail}
                accessible
                accessibilityRole="image"
              />
            )}
            {attachment.media_type === "video" &&
            attachment.status === "ready" ? (
              <View style={styles.playBadge}>
                <Ionicons name="play" size={14} color="#F4F4F4" />
              </View>
            ) : null}
          </TouchableOpacity>
          {editable ? (
            <TouchableOpacity
              style={styles.removeButton}
              disabled={isDeleting}
              onPress={() => deleteMediaAttachment(attachment.id)}
            >
              <Ionicons name="close-circle" size={20} color="#F4F4F4" />
            </TouchableOpacity>
          ) : null}
        </View>
      ))}
      <MediaViewer
        content={
          viewing
            ? {
                mediaType: viewing.media_type,
                mediaUri: viewing.playback_url,
                memo: viewing.memo ?? "",
              }
            : null
        }
        onClose={() => setViewingId(null)}
        editableMemo={editable}
        isSavingMemo={isUpdatingMemo}
        onSaveMemo={(memo) => {
          if (viewing) updateMediaAttachmentMemo({ id: viewing.id, memo });
        }}
      />
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
  processing: { justifyContent: "center", alignItems: "center" },
  playBadge: {
    position: "absolute",
    bottom: 6,
    right: 6,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 12,
    padding: 4,
  },
  removeButton: {
    position: "absolute",
    top: -6,
    right: -6,
  },
});

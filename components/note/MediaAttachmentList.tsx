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
  /** 削除ボタンを表示するか。ノート編集時はtrue、他ユーザーのノート閲覧時はfalse。 */
  editable?: boolean;
}

/** ノートに添付された画像・動画のサムネイルグリッド。タップでフルスクリーン再生。 */
export function MediaAttachmentList({ attachments, editable = false }: Props) {
  const { deleteMediaAttachment, isDeleting } = useMediaAttachmentMutations();
  const [viewing, setViewing] = useState<MediaAttachment | null>(null);

  if (attachments.length === 0) return null;

  return (
    <View style={styles.grid}>
      {attachments.map((attachment) => (
        <View key={attachment.id} style={styles.thumbnailWrapper}>
          <TouchableOpacity onPress={() => setViewing(attachment)}>
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
      <MediaViewer attachment={viewing} onClose={() => setViewing(null)} />
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

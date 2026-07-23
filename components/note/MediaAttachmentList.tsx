import type { MediaAttachment } from "../../types/mediaAttachment";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useEntitlement } from "@hooks/useEntitlement";
import { useMediaAttachmentMutations } from "@hooks/useMediaAttachmentMutations";
import { useMediaAttachmentUpload } from "@hooks/useMediaAttachmentUpload";
import { useVideoTrim } from "@hooks/useVideoTrim";
import {
  FREE_VIDEO_MAX_DURATION_SECONDS,
  PRO_VIDEO_MAX_DURATION_SECONDS,
} from "@utils/mediaLimits";
import { buildMediaMemoLabel } from "@utils/mediaMemoLabel";
import { MediaViewer } from "./MediaViewer";

interface Props {
  attachments: MediaAttachment[];
  /** 削除・メモ編集を可能にするか。ノート編集時はtrue、他ユーザーのノート閲覧時はfalse。 */
  editable?: boolean;
  /** 再トリミング時、新しい動画をアップロードし直す先のノートID。editable時のみ必要。 */
  noteId?: number;
}

/** ノートに添付された画像・動画のサムネイルグリッド。タップでフルスクリーン再生+メモ編集。 */
export function MediaAttachmentList({
  attachments,
  editable = false,
  noteId,
}: Props) {
  const {
    deleteMediaAttachment,
    isDeleting,
    updateMediaAttachmentMemo,
    isUpdatingMemo,
  } = useMediaAttachmentMutations();
  const { upload } = useMediaAttachmentUpload();
  const { trim, isTrimming } = useVideoTrim();
  const { hasEntitlement } = useEntitlement();
  const [viewingId, setViewingId] = useState<number | null>(null);
  const [trimmingId, setTrimmingId] = useState<number | null>(null);

  if (attachments.length === 0) return null;

  const viewing = attachments.find((item) => item.id === viewingId) ?? null;

  /**
   * アップロード済み動画の再トリミング。既存動画を直接編集する手段がないため、
   * トリミング後の動画を新規メディアとしてアップロードし、成功してから古い方を削除する
   * （アップロード失敗時に古い動画を失わないため、削除は成功後にのみ行う）。
   */
  const handleRetrim = async (attachment: MediaAttachment) => {
    if (noteId == null || !attachment.playback_url) return;
    const limitSeconds = hasEntitlement("unlimited_media_uploads")
      ? PRO_VIDEO_MAX_DURATION_SECONDS
      : FREE_VIDEO_MAX_DURATION_SECONDS;

    setTrimmingId(attachment.id);
    try {
      const result = await trim(attachment.playback_url, limitSeconds);
      if (!result) return;

      await upload(
        {
          uri: result.uri,
          mediaType: "video",
          contentType: "video/mp4",
          memo: attachment.memo ?? undefined,
        },
        noteId,
      );
      deleteMediaAttachment(attachment.id);
    } catch {
      Alert.alert("トリミングに失敗しました");
    } finally {
      setTrimmingId(null);
    }
  };

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
              <>
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
                <View style={styles.memoLabel}>
                  <Text style={styles.memoLabelText} numberOfLines={1}>
                    {buildMediaMemoLabel(
                      attachment.media_type,
                      attachment.memo,
                    )}
                  </Text>
                </View>
              </>
            )}
            {attachment.media_type === "video" &&
            attachment.status === "ready" ? (
              <View style={styles.playBadge}>
                <Ionicons name="play" size={16} color="#F4F4F4" />
              </View>
            ) : null}
            {trimmingId === attachment.id ? (
              <View style={styles.trimmingOverlay}>
                <ActivityIndicator size="small" color="#F4F4F4" />
              </View>
            ) : null}
          </TouchableOpacity>
          {editable &&
          attachment.media_type === "video" &&
          attachment.status === "ready" ? (
            <TouchableOpacity
              style={styles.trimButton}
              disabled={isTrimming}
              onPress={() => handleRetrim(attachment)}
            >
              <Ionicons name="cut-outline" size={16} color="#F4F4F4" />
            </TouchableOpacity>
          ) : null}
          {editable ? (
            <TouchableOpacity
              style={styles.removeButton}
              disabled={isDeleting}
              onPress={() => deleteMediaAttachment(attachment.id)}
            >
              <Ionicons name="close-circle" size={22} color="#F4F4F4" />
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
  processing: { justifyContent: "center", alignItems: "center" },
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
  playBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 14,
    padding: 5,
  },
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

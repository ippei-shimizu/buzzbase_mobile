import type { MediaType } from "../../types/mediaAttachment";
import { Ionicons } from "@expo/vector-icons";
import { VideoView, useVideoPlayer } from "expo-video";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ZoomableImage } from "@components/ui/ZoomableImage";

export interface MediaViewerContent {
  mediaType: MediaType;
  /** 表示するメディアのURI。アップロード済みは`playback_url`、ステージ中はローカルURI。 */
  mediaUri: string | null;
  memo: string;
}

interface Props {
  content: MediaViewerContent | null;
  onClose: () => void;
  /** メモを編集可能にするか（自分のノートの編集時のみtrue）。 */
  editableMemo?: boolean;
  isSavingMemo?: boolean;
  onSaveMemo?: (memo: string) => void;
}

function VideoContent({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri, (instance) => {
    instance.play();
  });
  return (
    <VideoView
      style={styles.media}
      player={player}
      contentFit="contain"
      nativeControls
    />
  );
}

/** ノートに添付された画像・動画のフルスクリーン表示 + メディアごとのメモ編集。 */
export function MediaViewer({
  content,
  onClose,
  editableMemo = false,
  isSavingMemo = false,
  onSaveMemo,
}: Props) {
  const [memoText, setMemoText] = useState("");

  useEffect(() => {
    setMemoText(content?.memo ?? "");
  }, [content]);

  const hasMemoChanged = content != null && memoText !== content.memo;

  return (
    <Modal
      visible={content != null}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={28} color="#F4F4F4" />
        </TouchableOpacity>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {content?.mediaType === "video" && content.mediaUri ? (
            <VideoContent uri={content.mediaUri} />
          ) : content?.mediaUri ? (
            <>
              <ZoomableImage
                uri={content.mediaUri}
                style={styles.media}
                accessibilityLabel="添付画像"
              />
              <Text style={styles.zoomHint}>
                ピンチまたはダブルタップで拡大できます
              </Text>
            </>
          ) : null}

          {editableMemo ? (
            <View style={styles.memoSection}>
              <TextInput
                style={styles.memoInput}
                value={memoText}
                onChangeText={setMemoText}
                multiline
                placeholder="このメディアについてのメモ"
                placeholderTextColor="#71717A"
              />
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  (!hasMemoChanged || isSavingMemo) &&
                    styles.saveButtonDisabled,
                ]}
                disabled={!hasMemoChanged || isSavingMemo}
                onPress={() => onSaveMemo?.(memoText)}
              >
                {isSavingMemo ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveButtonText}>保存</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : content?.memo ? (
            <Text style={styles.memoText}>{content.memo}</Text>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(46,46,46,0.96)" },
  content: {
    flexGrow: 1,
    alignItems: "center",
    paddingTop: 96,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  closeButton: {
    position: "absolute",
    top: 56,
    right: 20,
    zIndex: 1,
    padding: 8,
  },
  media: { width: "100%", height: 320 },
  zoomHint: {
    color: "#A1A1AA",
    fontSize: 12,
    marginTop: 8,
    alignSelf: "center",
  },
  memoSection: { width: "100%", marginTop: 16 },
  memoInput: {
    backgroundColor: "#3A3A3A",
    borderRadius: 8,
    padding: 12,
    color: "#F4F4F4",
    fontSize: 15,
    minHeight: 120,
    textAlignVertical: "top",
  },
  saveButton: {
    backgroundColor: "#d08000",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 12,
  },
  saveButtonDisabled: { opacity: 0.5 },
  saveButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  memoText: {
    color: "#F4F4F4",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 16,
    width: "100%",
  },
});

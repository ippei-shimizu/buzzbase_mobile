import type { MediaAttachment } from "../../types/mediaAttachment";
import { Ionicons } from "@expo/vector-icons";
import { VideoView, useVideoPlayer } from "expo-video";
import { Image, Modal, StyleSheet, TouchableOpacity, View } from "react-native";

interface Props {
  attachment: MediaAttachment | null;
  onClose: () => void;
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

/** ノートに添付された画像・動画のフルスクリーン表示。 */
export function MediaViewer({ attachment, onClose }: Props) {
  return (
    <Modal
      visible={attachment != null}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={28} color="#F4F4F4" />
        </TouchableOpacity>
        {attachment?.media_type === "video" && attachment.playback_url ? (
          <VideoContent uri={attachment.playback_url} />
        ) : attachment?.playback_url ? (
          <Image
            source={{ uri: attachment.playback_url }}
            style={styles.media}
            resizeMode="contain"
          />
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 56,
    right: 20,
    zIndex: 1,
    padding: 8,
  },
  media: { width: "100%", height: "80%" },
});

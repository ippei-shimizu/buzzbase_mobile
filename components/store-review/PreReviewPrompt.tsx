import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  visible: boolean;
  onYes: () => void;
  onNo: () => void;
}

export function PreReviewPrompt({ visible, onYes, onNo }: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onNo}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>BUZZ BASEは気に入っていますか？</Text>
          <Text style={styles.subText}>ご感想をお聞かせください</Text>
          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={onYes}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>気に入っている</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={onNo}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>
                改善して欲しいことがある
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#2E2E2E",
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#F4F4F4",
    textAlign: "center",
    marginBottom: 8,
  },
  subText: {
    fontSize: 13,
    color: "#A1A1AA",
    textAlign: "center",
    marginBottom: 20,
  },
  buttons: {
    gap: 12,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    backgroundColor: "#d08000",
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#F4F4F4",
  },
  secondaryButton: {
    backgroundColor: "#3A3A3A",
    borderWidth: 1,
    borderColor: "#52525B",
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#D4D4D8",
  },
});

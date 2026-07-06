import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet } from "react-native";

interface Props {
  visible: boolean;
  onPress: () => void;
}

/** 画面右下に浮かぶ「トップに戻る」ボタン。visible=false のときは描画しない。 */
export function BackToTopButton({ visible, onPress }: Props) {
  if (!visible) return null;
  return (
    <Pressable
      onPress={onPress}
      style={styles.button}
      accessibilityRole="button"
      accessibilityLabel="画面のトップに戻る"
    >
      <Ionicons name="chevron-up" size={20} color="#F4F4F4" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    right: 16,
    bottom: 24,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#d08000",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
});

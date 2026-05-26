import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProSuccessScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.content}>
        <Ionicons name="checkmark-circle" size={72} color="#10b981" />
        <Text style={styles.title}>Pro 加入手続きを受け付けました</Text>
        <Text style={styles.description}>
          App Store の決済確定後、自動的に Pro
          機能がご利用いただけるようになります。反映には数秒〜数十秒かかる場合があります。
        </Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.replace("/(tabs)")}
          accessibilityRole="button"
          accessibilityLabel="ホームへ戻る"
        >
          <Text style={styles.primaryButtonText}>ホームへ戻る</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.replace("/account/subscription")}
          accessibilityRole="button"
          accessibilityLabel="加入状態を確認する"
        >
          <Text style={styles.secondaryButtonText}>加入状態を確認する</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2E2E2E",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 16,
  },
  title: {
    color: "#F4F4F4",
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 8,
  },
  description: {
    color: "#D4D4D4",
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: "#d08000",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    minWidth: 240,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#F4F4F4",
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: "#d08000",
    fontSize: 14,
    fontWeight: "600",
  },
});

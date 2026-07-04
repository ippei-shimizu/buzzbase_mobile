import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { usePeriodicReviews } from "@hooks/usePeriodicReviews";

/**
 * 未読の週次/月次レポートがある時だけ表示する誘導バナー。
 * 回顧の報酬（がんばりの承認）と次サイクルの起点をホームで示す。
 */
export function PeriodicReviewBanner() {
  const router = useRouter();
  const { reviews } = usePeriodicReviews();
  const unread = reviews.filter((review) => !review.read);

  if (unread.length === 0) return null;

  return (
    <TouchableOpacity
      style={styles.banner}
      onPress={() => router.push("/(review)/list")}
    >
      <Ionicons name="sparkles" size={18} color="#F4F4F4" />
      <View style={styles.textWrap}>
        <Text style={styles.title}>振り返りレポートが届いています</Text>
        <Text style={styles.sub}>未読 {unread.length} 件・タップで確認</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#F4F4F4" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#d08000",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  textWrap: { flex: 1 },
  title: { color: "#F4F4F4", fontSize: 14, fontWeight: "700" },
  sub: { color: "#F4F4F4", fontSize: 12, marginTop: 2 },
});

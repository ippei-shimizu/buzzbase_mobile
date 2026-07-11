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
  const { reviews, isError, refetch } = usePeriodicReviews();
  const unread = reviews.filter((review) => !review.read);

  // 取得失敗を「未読なし」と同一視しない。タップで再試行できる控えめなバナーを出す。
  if (isError) {
    return (
      <TouchableOpacity
        style={[styles.banner, styles.bannerError]}
        onPress={() => void refetch()}
        accessibilityRole="button"
        accessibilityLabel="振り返りレポートの再取得"
      >
        <Ionicons name="alert-circle-outline" size={18} color="#A1A1AA" />
        <View style={styles.textWrap}>
          <Text style={styles.errorTitle}>
            振り返りレポートを取得できませんでした
          </Text>
          <Text style={styles.errorSub}>タップで再試行</Text>
        </View>
      </TouchableOpacity>
    );
  }

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
  bannerError: { backgroundColor: "#3A3A3A" },
  errorTitle: { color: "#A1A1AA", fontSize: 13, fontWeight: "600" },
  errorSub: { color: "#d08000", fontSize: 12, marginTop: 2 },
});

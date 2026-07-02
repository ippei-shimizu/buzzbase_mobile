import { useEffect } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { PeriodicReviewCard } from "@components/periodic-review/PeriodicReviewCard";
import {
  usePeriodicReviewMutations,
  usePeriodicReviews,
} from "@hooks/usePeriodicReviews";

export default function ReviewListScreen() {
  const { reviews, isLoading } = usePeriodicReviews();
  const { markRead } = usePeriodicReviewMutations();

  // 一覧を開いた時点で未読を既読化する（未読バッジの解消）。
  useEffect(() => {
    reviews
      .filter((review) => !review.read)
      .forEach((review) => {
        void markRead(review.id);
      });
    // markRead は安定参照、reviews の未読分のみを対象にする
  }, [reviews, markRead]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#d08000" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {reviews.length === 0 ? (
        <Text style={styles.emptyText}>
          週末・月末に、その期間のがんばりと成績の振り返りがここに届きます。
        </Text>
      ) : (
        reviews.map((review) => (
          <PeriodicReviewCard key={review.id} review={review} />
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#2E2E2E" },
  centered: {
    flex: 1,
    backgroundColor: "#2E2E2E",
    alignItems: "center",
    justifyContent: "center",
  },
  content: { padding: 16, paddingBottom: 40 },
  emptyText: { color: "#A1A1AA", fontSize: 13, lineHeight: 20 },
});

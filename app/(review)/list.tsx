import type { PeriodicReview } from "../../types/periodicReview";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { PeriodicReviewCard } from "@components/periodic-review/PeriodicReviewCard";
import { BlurredProContent } from "@components/pro/BlurredProContent";
import { PaywallModal, PRO_PAYWALL_COPY } from "@components/pro/PaywallModal";
import { useEntitlement } from "@hooks/useEntitlement";
import {
  usePeriodicReviewMutations,
  usePeriodicReviews,
} from "@hooks/usePeriodicReviews";

// 振り返りレポートは Pro 限定機能。無料ユーザーには実データの代わりにこのサンプルを見せ、
// 実際のレイアウトのまま「何が届くか」を伝える。
const DUMMY_REVIEW: PeriodicReview = {
  id: -1,
  period_type: "weekly",
  period_start: "2026-07-06",
  period_end: "2026-07-12",
  read: true,
  summary: {
    period_type: "weekly",
    practice_days: 5,
    total_swings: 1200,
    active_days: 5,
    streak_current: 12,
    theme_breakdown: [{ id: -1, title: "肩の開き", practice_count: 4 }],
    condition: { sleep_hours_avg: 7.2, fatigue_level_avg: 2.4 },
    batting: {
      batting_average: 0.312,
      on_base_percentage: 0.388,
      slugging_percentage: 0.451,
      ops: 0.839,
      previous_batting_average: 0.286,
      delta: 0.026,
    },
    insight: {
      key: "sample",
      id: null,
      title: "素振りと打率の関係",
      body: "素振りを週1500本以上やった週は、打率が.045高い傾向があります。",
      metric: "batting_average",
      dimension: "total_swings",
      direction: "positive",
      strength: "strong",
      sample_weeks: 8,
      sufficient: true,
    },
  },
};

export default function ReviewListScreen() {
  const { hasEntitlement } = useEntitlement();
  const canViewReviews = hasEntitlement("advanced_periodic_review");
  const { reviews, isLoading } = usePeriodicReviews();
  const { markReadMany } = usePeriodicReviewMutations();
  const [isPaywallOpen, setPaywallOpen] = useState(false);

  // 一覧を開いた時点で未読を既読化する（未読バッジの解消）。
  // 個別ミューテーションを並列発火すると未読件数分の再フェッチが起きるため、
  // 全件の完了を待ってから invalidate を1回にまとめる。
  useEffect(() => {
    if (!canViewReviews) return;
    const unreadIds = reviews
      .filter((review) => !review.read)
      .map((review) => review.id);
    if (unreadIds.length === 0) return;
    void markReadMany(unreadIds);
    // markReadMany は安定参照、reviews の未読分のみを対象にする
  }, [reviews, markReadMany, canViewReviews]);

  if (!canViewReviews) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <BlurredProContent
            unlocked={false}
            title={PRO_PAYWALL_COPY.advanced_periodic_review.title}
            description={PRO_PAYWALL_COPY.advanced_periodic_review.description}
            badgeLabel="Pro に加入する"
            onPressBadge={() => setPaywallOpen(true)}
          >
            <PeriodicReviewCard review={DUMMY_REVIEW} />
          </BlurredProContent>
        </View>
        <PaywallModal
          isOpen={isPaywallOpen}
          onClose={() => setPaywallOpen(false)}
          feature="advanced_periodic_review"
        />
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#d08000" />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={reviews}
      keyExtractor={(review: PeriodicReview) => String(review.id)}
      renderItem={({ item }) => <PeriodicReviewCard review={item} />}
      ListEmptyComponent={
        <Text style={styles.emptyText}>
          週末・月末に、その期間のがんばりと成績の振り返りがここに届きます。
        </Text>
      }
    />
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

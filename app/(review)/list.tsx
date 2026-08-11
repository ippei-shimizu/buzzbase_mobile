import type { PeriodicReview } from "../../types/periodicReview";
import { useEffect, useState } from "react";
import { FlatList, ScrollView, StyleSheet, Text, View } from "react-native";
import { PeriodicReviewCard } from "@components/periodic-review/PeriodicReviewCard";
import { PaywallModal } from "@components/pro/PaywallModal";
import { ProUpsellCard } from "@components/pro/ProUpsellCard";
import { SampleDataLabel } from "@components/pro/SampleDataLabel";
import { SkeletonList } from "@components/ui/Skeleton";
import { useEntitlement } from "@hooks/useEntitlement";
import {
  usePeriodicReviewMutations,
  usePeriodicReviews,
} from "@hooks/usePeriodicReviews";

// 振り返りレポートは Pro 限定機能。無料ユーザーには実データの代わりにこのサンプルを見せ、
// 実際のレイアウトのまま「何が届くか」を伝える。3週分見せて毎週届く機能だと分かるようにする。
const DUMMY_REVIEWS: PeriodicReview[] = [
  {
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
        key: "sample-1",
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
  },
  {
    id: -2,
    period_type: "weekly",
    period_start: "2026-06-29",
    period_end: "2026-07-05",
    read: true,
    summary: {
      period_type: "weekly",
      practice_days: 4,
      total_swings: 900,
      active_days: 4,
      streak_current: 20,
      theme_breakdown: [{ id: -2, title: "体重移動", practice_count: 3 }],
      condition: { sleep_hours_avg: 6.8, fatigue_level_avg: 2.8 },
      batting: {
        batting_average: 0.286,
        on_base_percentage: 0.351,
        slugging_percentage: 0.401,
        ops: 0.752,
        previous_batting_average: 0.298,
        delta: -0.012,
      },
      insight: {
        key: "sample-2",
        id: null,
        title: "睡眠時間と調子の関係",
        body: "睡眠が7時間を下回った週は、疲労度の自己評価が高くなる傾向があります。",
        metric: "fatigue_level_avg",
        dimension: "sleep_hours_avg",
        direction: "negative",
        strength: "moderate",
        sample_weeks: 6,
        sufficient: true,
      },
    },
  },
  {
    id: -3,
    period_type: "weekly",
    period_start: "2026-06-22",
    period_end: "2026-06-28",
    read: true,
    summary: {
      period_type: "weekly",
      practice_days: 6,
      total_swings: 1500,
      active_days: 6,
      streak_current: 18,
      theme_breakdown: [{ id: -3, title: "外角対応", practice_count: 5 }],
      condition: { sleep_hours_avg: 7.5, fatigue_level_avg: 2.1 },
      batting: {
        batting_average: 0.333,
        on_base_percentage: 0.402,
        slugging_percentage: 0.478,
        ops: 0.88,
        previous_batting_average: 0.312,
        delta: 0.021,
      },
      insight: {
        key: "sample-3",
        id: null,
        title: "練習日数と打率の関係",
        body: "週6日以上練習した週は、翌週の打率が上がる傾向があります。",
        metric: "batting_average",
        dimension: "practice_days",
        direction: "positive",
        strength: "strong",
        sample_weeks: 10,
        sufficient: true,
      },
    },
  },
];

export default function ReviewListScreen() {
  const { hasEntitlement, isLoading: isProLoading } = useEntitlement();
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

  // pro/status 解決前は canViewReviews が false 倒しになり、Pro ユーザーへ一瞬
  // サンプル表示がフラッシュしてしまう。データ取得も同じ待ち状態にまとめ、二度点滅させない。
  if (isProLoading || (canViewReviews && isLoading)) {
    return (
      <View style={styles.skeleton}>
        <SkeletonList count={3} itemHeight={140} />
      </View>
    );
  }

  if (!canViewReviews) {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <ProUpsellCard
            feature="advanced_periodic_review"
            onPressCta={() => setPaywallOpen(true)}
          />
          <SampleDataLabel />
          <View pointerEvents="none" style={styles.dummyList}>
            {DUMMY_REVIEWS.map((review) => (
              <PeriodicReviewCard key={review.id} review={review} />
            ))}
          </View>
        </ScrollView>
        <PaywallModal
          isOpen={isPaywallOpen}
          onClose={() => setPaywallOpen(false)}
          feature="advanced_periodic_review"
        />
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
  skeleton: { flex: 1, backgroundColor: "#2E2E2E", padding: 16, gap: 12 },
  container: { flex: 1, backgroundColor: "#2E2E2E" },
  centered: {
    flex: 1,
    backgroundColor: "#2E2E2E",
    alignItems: "center",
    justifyContent: "center",
  },
  content: { padding: 16, paddingBottom: 40 },
  emptyText: { color: "#A1A1AA", fontSize: 13, lineHeight: 20 },
  dummyList: {
    gap: 16,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#52525B",
  },
});

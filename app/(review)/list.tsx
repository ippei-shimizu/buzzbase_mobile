import type { PeriodicReview } from "../../types/periodicReview";
import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Icon } from "@components/icon/Icon";
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
      condition: {
        sleep_hours_avg: 7.2,
        fatigue_level_avg: 2.4,
        physical_level_avg: 3.6,
      },
      practice_menus: {
        items: [
          { name: "素振り", count: 5, total_amount: 1200, unit_label: "本" },
          {
            name: "ティーバッティング",
            count: 3,
            total_amount: 150,
            unit_label: "本",
          },
          { name: "ランニング", count: 2, total_amount: 40, unit_label: "分" },
        ],
        other_count: 1,
      },
      note_days: 4,
      goals: [
        {
          id: -1,
          title: "今月2000本素振り",
          kind: "numeric",
          metric_key: "total_swing_count",
          custom_metric_label: null,
          current_value: 1450,
          target_value: 2000,
          progress_percent: 72.5,
          achieved: false,
          deadline: "2026-07-31",
        },
        {
          id: -2,
          title: "打率.300を超える",
          kind: "numeric",
          metric_key: "batting_average",
          custom_metric_label: null,
          current_value: 0.312,
          target_value: 0.3,
          progress_percent: 100,
          achieved: true,
          deadline: "2026-07-31",
        },
      ],
      batting: {
        batting_average: 0.312,
        on_base_percentage: 0.388,
        slugging_percentage: 0.451,
        ops: 0.839,
        previous_batting_average: 0.286,
        delta: 0.026,
        hits: 5,
        two_base_hits: 2,
        three_base_hits: 0,
        home_runs: 1,
        stolen_bases: 2,
        strikeouts: 3,
        scoring_position: { batting_average: 0.4, at_bats: 5, hits: 2 },
      },
      pitching: {
        appearances: 1,
        innings_pitched: 7,
        era: 2.57,
        whip: 1.14,
        k_per_9: 9,
        strikeouts: 7,
        base_on_balls: 2,
        hit_by_pitch: 0,
        hits_allowed: 6,
        home_runs_allowed: 0,
        runs_allowed: 3,
        earned_runs: 2,
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
      condition: {
        sleep_hours_avg: 6.8,
        fatigue_level_avg: 2.8,
        physical_level_avg: 3.1,
      },
      practice_menus: {
        items: [
          { name: "素振り", count: 4, total_amount: 900, unit_label: "本" },
          {
            name: "ティーバッティング",
            count: 2,
            total_amount: 100,
            unit_label: "本",
          },
        ],
        other_count: 0,
      },
      note_days: 3,
      batting: {
        batting_average: 0.286,
        on_base_percentage: 0.351,
        slugging_percentage: 0.401,
        ops: 0.752,
        previous_batting_average: 0.298,
        delta: -0.012,
        hits: 4,
        two_base_hits: 1,
        three_base_hits: 0,
        home_runs: 0,
        stolen_bases: 1,
        strikeouts: 4,
        scoring_position: { batting_average: 0.25, at_bats: 4, hits: 1 },
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
      condition: {
        sleep_hours_avg: 7.5,
        fatigue_level_avg: 2.1,
        physical_level_avg: 3.9,
      },
      practice_menus: {
        items: [
          { name: "素振り", count: 6, total_amount: 1500, unit_label: "本" },
          { name: "ノック", count: 3, total_amount: 90, unit_label: "分" },
        ],
        other_count: 0,
      },
      note_days: 5,
      batting: {
        batting_average: 0.333,
        on_base_percentage: 0.402,
        slugging_percentage: 0.478,
        ops: 0.88,
        previous_batting_average: 0.312,
        delta: 0.021,
        hits: 6,
        two_base_hits: 2,
        three_base_hits: 1,
        home_runs: 0,
        stolen_bases: 3,
        strikeouts: 2,
        scoring_position: { batting_average: 0.5, at_bats: 6, hits: 3 },
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

const monthKey = (iso: string): string => iso.slice(0, 7);
const monthLabel = (key: string): string => {
  const [year, month] = key.split("-").map(Number);
  return `${year}年${month}月`;
};
const reviewDateOf = (review: PeriodicReview): string => review.period_start;

// 全期間を縦に並べると期間が増えるほど目的のレポートに辿り着けないため、
// 練習記録一覧と同じくレポートがある月だけを1ページずつ送る。monthIndex 0 が最新月。
function useMonthPagination(reviews: PeriodicReview[]) {
  const months = useMemo(() => {
    const set = new Set(
      reviews.map((review) => monthKey(reviewDateOf(review))),
    );
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [reviews]);
  const [monthIndex, setMonthIndex] = useState(0);
  const safeIndex = Math.min(monthIndex, Math.max(0, months.length - 1));
  const currentMonth = months[safeIndex] ?? null;
  const currentItems = useMemo(
    () =>
      currentMonth
        ? reviews.filter(
            (review) => monthKey(reviewDateOf(review)) === currentMonth,
          )
        : [],
    [reviews, currentMonth],
  );
  return {
    months,
    monthIndex: safeIndex,
    setMonthIndex,
    currentItems,
    currentMonthLabel: currentMonth ? monthLabel(currentMonth) : "",
  };
}

// 月ナビ（◀ 前月 / 「2026年7月・N件」 / 翌月 ▶）。両端でボタンを無効化する。
function MonthPaginator({
  label,
  count,
  index,
  total,
  onChange,
}: {
  label: string;
  count: number;
  index: number;
  total: number;
  onChange: (next: number) => void;
}) {
  const atOldest = index >= total - 1;
  const atNewest = index <= 0;
  return (
    <View style={styles.monthNav}>
      <TouchableOpacity
        disabled={atOldest}
        onPress={() => onChange(index + 1)}
        accessibilityRole="button"
        accessibilityLabel="前の月"
        hitSlop={8}
      >
        <Icon
          name="chevron-back"
          size={22}
          color={atOldest ? "#52525B" : "#d08000"}
        />
      </TouchableOpacity>
      <Text style={styles.monthNavLabel}>
        {label}
        <Text style={styles.monthNavCount}>{`　${count}件`}</Text>
      </Text>
      <TouchableOpacity
        disabled={atNewest}
        onPress={() => onChange(index - 1)}
        accessibilityRole="button"
        accessibilityLabel="次の月"
        hitSlop={8}
      >
        <Icon
          name="chevron-forward"
          size={22}
          color={atNewest ? "#52525B" : "#d08000"}
        />
      </TouchableOpacity>
    </View>
  );
}

export default function ReviewListScreen() {
  const { hasEntitlement, isLoading: isProLoading } = useEntitlement();
  const canViewReviews = hasEntitlement("advanced_periodic_review");
  const { reviews, isLoading } = usePeriodicReviews();
  const { markReadMany } = usePeriodicReviewMutations();
  const [isPaywallOpen, setPaywallOpen] = useState(false);
  const pager = useMonthPagination(reviews);

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
      data={pager.currentItems}
      keyExtractor={(review: PeriodicReview) => String(review.id)}
      renderItem={({ item }) => <PeriodicReviewCard review={item} />}
      ListHeaderComponent={
        reviews.length > 0 ? (
          <MonthPaginator
            label={pager.currentMonthLabel}
            count={pager.currentItems.length}
            index={pager.monthIndex}
            total={pager.months.length}
            onChange={pager.setMonthIndex}
          />
        ) : null
      }
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
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#3A3A3A",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 12,
  },
  monthNavLabel: { color: "#F4F4F4", fontSize: 15, fontWeight: "700" },
  monthNavCount: { color: "#A1A1AA", fontSize: 12, fontWeight: "400" },
  container: { flex: 1, backgroundColor: "#2E2E2E" },
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

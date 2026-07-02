import type { PeriodicReview } from "../../types/periodicReview";
import { StyleSheet, Text, View } from "react-native";

const periodLabel = (review: PeriodicReview): string => {
  const kind = review.period_type === "weekly" ? "今週" : "今月";
  return `${kind}の振り返り（${review.period_start} 〜 ${review.period_end}）`;
};

/**
 * 週次 / 月次レポートのカード。
 * 基本部（練習日数・素振り・Streak）は常に、詳細部（課題別・成績・相関）は
 * summary に含まれる場合のみ（＝Pro）表示する。
 */
export function PeriodicReviewCard({ review }: { review: PeriodicReview }) {
  const { summary } = review;
  const batting = summary.batting;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{periodLabel(review)}</Text>

      <View style={styles.statsRow}>
        <Stat label="練習日数" value={`${summary.practice_days}日`} />
        <Stat label="素振り" value={`${summary.total_swings}`} />
        <Stat label="連続" value={`${summary.streak_current}日`} />
      </View>

      {batting ? (
        <Text style={styles.detail}>
          打率 {batting.batting_average.toFixed(3)}（前期間比{" "}
          {batting.delta >= 0 ? "+" : ""}
          {batting.delta.toFixed(3)}）
        </Text>
      ) : null}

      {summary.theme_breakdown && summary.theme_breakdown.length > 0 ? (
        <Text style={styles.detail}>
          課題:{" "}
          {summary.theme_breakdown
            .map((theme) => `${theme.title}（${theme.practice_count}回）`)
            .join("、")}
        </Text>
      ) : null}

      {summary.insight ? (
        <Text style={styles.insight}>{summary.insight.body}</Text>
      ) : null}
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#3A3A3A",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  title: { color: "#F4F4F4", fontSize: 15, fontWeight: "700" },
  statsRow: { flexDirection: "row", gap: 12, marginTop: 14 },
  stat: {
    flex: 1,
    backgroundColor: "#2E2E2E",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  statValue: { color: "#d08000", fontSize: 18, fontWeight: "700" },
  statLabel: { color: "#A1A1AA", fontSize: 11, marginTop: 4 },
  detail: { color: "#F4F4F4", fontSize: 13, marginTop: 12, lineHeight: 19 },
  insight: {
    color: "#F4F4F4",
    fontSize: 13,
    marginTop: 12,
    lineHeight: 19,
    fontStyle: "italic",
  },
});

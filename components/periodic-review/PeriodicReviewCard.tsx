import type { PeriodicReview } from "../../types/periodicReview";
import { StyleSheet, Text, View } from "react-native";
import { formatJaFullDate } from "@utils/formatDate";

const periodLabel = (review: PeriodicReview): string =>
  review.period_type === "weekly" ? "今週の振り返り" : "今月の振り返り";

// 打率などの小数は先頭の 0 を省いて .XXX 表記にする。
// 旧レポートには新指標（出塁率/長打率/OPS）が無いため、欠損値は "-" を返す。
const fmt3 = (value: number | null | undefined): string =>
  value == null ? "-" : value.toFixed(3).replace(/^0\./, ".");

/**
 * 週次 / 月次レポートのカード。
 * 練習量・成績（打撃・投手）は全ユーザーに、課題別内訳・インサイトは
 * summary に含まれる場合のみ（＝Pro）表示する。
 */
export function PeriodicReviewCard({ review }: { review: PeriodicReview }) {
  const { summary } = review;
  const batting = summary.batting;
  const pitching = summary.pitching;
  const hasPitching = !!pitching && pitching.era != null;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{periodLabel(review)}</Text>
      <Text style={styles.period}>
        {formatJaFullDate(review.period_start)} 〜{" "}
        {formatJaFullDate(review.period_end)}
      </Text>

      <View style={styles.statsRow}>
        <Stat label="練習日数" value={`${summary.practice_days}日`} />
        <Stat label="素振り" value={`${summary.total_swings}`} />
        <Stat label="連続" value={`${summary.streak_current}日`} />
      </View>

      {batting ? (
        <>
          <Text style={styles.sectionLabel}>打撃</Text>
          <View style={styles.metricRow}>
            <Metric label="打率" value={fmt3(batting.batting_average)} />
            <Metric label="出塁率" value={fmt3(batting.on_base_percentage)} />
            <Metric label="長打率" value={fmt3(batting.slugging_percentage)} />
            <Metric label="OPS" value={fmt3(batting.ops)} />
          </View>
          {batting.delta != null ? (
            <Text style={styles.trend}>
              打率 前期間比 {batting.delta >= 0 ? "+" : ""}
              {fmt3(batting.delta)}
            </Text>
          ) : null}
        </>
      ) : null}

      {hasPitching ? (
        <>
          <Text style={styles.sectionLabel}>投手</Text>
          <View style={styles.metricRow}>
            <Metric label="防御率" value={pitching!.era?.toFixed(2) ?? "-"} />
            <Metric label="WHIP" value={pitching!.whip?.toFixed(2) ?? "-"} />
            <Metric label="K/9" value={pitching!.k_per_9?.toFixed(1) ?? "-"} />
          </View>
        </>
      ) : null}

      {summary.theme_breakdown && summary.theme_breakdown.length > 0 ? (
        <>
          <Text style={styles.sectionLabel}>課題</Text>
          <Text style={styles.detail}>
            {summary.theme_breakdown
              .map((theme) => `${theme.title}（${theme.practice_count}回）`)
              .join("、")}
          </Text>
        </>
      ) : null}

      {summary.insight ? (
        <>
          <Text style={styles.sectionLabel}>インサイト</Text>
          <Text style={styles.insight}>{summary.insight.body}</Text>
        </>
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

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
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
  title: { color: "#F4F4F4", fontSize: 16, fontWeight: "700" },
  period: { color: "#A1A1AA", fontSize: 12, marginTop: 4 },
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
  sectionLabel: {
    color: "#A1A1AA",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
  },
  metricRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  metric: {
    flexGrow: 1,
    minWidth: 72,
    backgroundColor: "#2E2E2E",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  metricValue: { color: "#F4F4F4", fontSize: 16, fontWeight: "700" },
  metricLabel: { color: "#A1A1AA", fontSize: 11, marginTop: 3 },
  trend: { color: "#A1A1AA", fontSize: 12, marginTop: 8 },
  detail: { color: "#F4F4F4", fontSize: 13, lineHeight: 19 },
  insight: {
    color: "#F4F4F4",
    fontSize: 13,
    lineHeight: 19,
    fontStyle: "italic",
  },
});

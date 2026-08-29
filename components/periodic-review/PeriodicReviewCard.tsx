import type {
  PeriodicReview,
  PeriodicReviewGoal,
} from "../../types/periodicReview";
import { StyleSheet, Text, View } from "react-native";
import { formatMetricValue, metricLabel } from "@constants/goal";
import { formatJaFullDate } from "@utils/formatDate";

/**
 * カード見出し。週次は period_start が属する月内の何週目か（「7月 第2週の振り返り」）、
 * 月次は月表記（「2026年7月の振り返り」）にする。
 * 月をまたぐ週は開始日（月曜）の月に帰属させ、第N週は開始日の日付から7日刻みで決める。
 */
const periodLabel = (review: PeriodicReview): string => {
  const [year, month, day] = review.period_start.split("-").map(Number);
  if (review.period_type === "monthly") {
    return `${year}年${month}月の振り返り`;
  }
  const weekOfMonth = Math.floor((day - 1) / 7) + 1;
  return `${month}月 第${weekOfMonth}週の振り返り`;
};

// 打率などの小数は先頭の 0 を省いて .XXX 表記にする。
// 旧レポートには新指標が無いため、欠損値は "-" を返す（0 と誤読させない）。
const fmt3 = (value: number | null | undefined): string =>
  value == null ? "-" : value.toFixed(3).replace(/^0\./, ".");

const fmtCount = (value: number | null | undefined, unit = ""): string =>
  value == null ? "-" : `${value.toLocaleString("ja-JP")}${unit}`;

const fmtFixed = (value: number | null | undefined, digits: number): string =>
  value == null ? "-" : value.toFixed(digits);

/** 目標の「指標ラベル 現在値 / 目標値」。kind ごとに current_value の意味が違う。 */
const goalValueLabel = (goal: PeriodicReviewGoal): string => {
  if (goal.kind === "qualitative") return "";
  if (goal.kind === "manual") {
    return `${goal.custom_metric_label ?? ""} ${fmtCount(goal.current_value)} / ${fmtCount(goal.target_value)}`;
  }
  const current =
    goal.current_value == null
      ? "-"
      : formatMetricValue(goal.metric_key, goal.current_value);
  const target =
    goal.target_value == null
      ? "-"
      : formatMetricValue(goal.metric_key, goal.target_value);
  return `${metricLabel(goal.metric_key)} ${current} / ${target}`;
};

/**
 * 週次 / 月次レポートのカード。
 * 練習量・成績（打撃・投手）は全ユーザーに、課題別内訳・コンディション・
 * メニュー別内訳・目標・インサイトは summary に含まれる場合のみ（＝Pro）表示する。
 */
export function PeriodicReviewCard({ review }: { review: PeriodicReview }) {
  const { summary } = review;
  const batting = summary.batting;
  const pitching = summary.pitching;
  const condition = summary.condition;
  const practiceMenus = summary.practice_menus?.items ?? [];
  const practiceMenuOthers = summary.practice_menus?.other_count ?? 0;
  const goals = summary.goals ?? [];
  const hasPitching =
    !!pitching && (pitching.era != null || (pitching.appearances ?? 0) > 0);

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
            {/* 母数 0（得点圏の新フォーマット打席が無い）は back が打率 null で保存するため "-" に落ちる */}
            <Metric
              label="得点圏打率"
              value={fmt3(batting.scoring_position?.batting_average)}
            />
          </View>
          <View style={[styles.metricRow, styles.metricRowSpacing]}>
            <Metric label="安打" value={fmtCount(batting.hits)} />
            <Metric label="二塁打" value={fmtCount(batting.two_base_hits)} />
            <Metric label="三塁打" value={fmtCount(batting.three_base_hits)} />
            <Metric label="本塁打" value={fmtCount(batting.home_runs)} />
            <Metric label="盗塁" value={fmtCount(batting.stolen_bases)} />
            <Metric label="三振" value={fmtCount(batting.strikeouts)} />
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
            <Metric label="防御率" value={fmtFixed(pitching!.era, 2)} />
            <Metric label="WHIP" value={fmtFixed(pitching!.whip, 2)} />
            <Metric label="K/9" value={fmtFixed(pitching!.k_per_9, 1)} />
            <Metric label="登板" value={fmtCount(pitching!.appearances)} />
            <Metric label="奪三振" value={fmtCount(pitching!.strikeouts)} />
          </View>
          <View style={[styles.metricRow, styles.metricRowSpacing]}>
            <Metric label="与四球" value={fmtCount(pitching!.base_on_balls)} />
            <Metric label="与死球" value={fmtCount(pitching!.hit_by_pitch)} />
            <Metric label="被安打" value={fmtCount(pitching!.hits_allowed)} />
            <Metric
              label="被本塁打"
              value={fmtCount(pitching!.home_runs_allowed)}
            />
            <Metric label="失点" value={fmtCount(pitching!.runs_allowed)} />
            <Metric label="自責点" value={fmtCount(pitching!.earned_runs)} />
          </View>
        </>
      ) : null}

      {practiceMenus.length > 0 ? (
        <>
          <Text style={styles.sectionLabel}>練習メニュー別</Text>
          <View style={styles.menuList}>
            {practiceMenus.map((menu) => (
              <View key={menu.name} style={styles.menuRow}>
                <Text style={styles.menuName} numberOfLines={1}>
                  {menu.name}
                </Text>
                <Text style={styles.menuValue}>
                  {fmtCount(menu.count, "回")}
                  {menu.total_amount
                    ? `・${fmtCount(menu.total_amount)}${menu.unit_label ?? ""}`
                    : ""}
                </Text>
              </View>
            ))}
          </View>
          {practiceMenuOthers > 0 ? (
            <Text style={styles.menuOthers}>
              他 {practiceMenuOthers} 件のメニュー
            </Text>
          ) : null}
        </>
      ) : null}

      {condition ? (
        <>
          <Text style={styles.sectionLabel}>コンディション</Text>
          <View style={styles.metricRow}>
            <Metric
              label="平均睡眠"
              value={
                condition.sleep_hours_avg == null
                  ? "-"
                  : `${fmtFixed(condition.sleep_hours_avg, 1)}h`
              }
            />
            <Metric
              label="平均疲労度"
              value={fmtFixed(condition.fatigue_level_avg, 1)}
            />
            <Metric
              label="平均体調"
              value={fmtFixed(condition.physical_level_avg, 1)}
            />
          </View>
        </>
      ) : null}

      {summary.note_days != null ? (
        <>
          <Text style={styles.sectionLabel}>野球ノート</Text>
          <Text style={styles.detail}>
            記録した日数 {fmtCount(summary.note_days, "日")}
          </Text>
        </>
      ) : null}

      {goals.length > 0 ? (
        <>
          <Text style={styles.sectionLabel}>目標の進捗</Text>
          <View style={styles.goalList}>
            {goals.map((goal) => (
              <View key={goal.id} style={styles.goalRow}>
                <Text style={styles.goalTitle} numberOfLines={1}>
                  {goal.title}
                </Text>
                {goal.achieved ? (
                  <Text style={styles.goalAchieved}>達成</Text>
                ) : null}
                {goal.kind !== "qualitative" ? (
                  <Text style={styles.goalValue}>
                    {goalValueLabel(goal)}
                    {goal.progress_percent != null
                      ? `（${Math.round(goal.progress_percent)}%）`
                      : ""}
                  </Text>
                ) : null}
              </View>
            ))}
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
  metricRowSpacing: { marginTop: 8 },
  metric: {
    flexGrow: 1,
    minWidth: 72,
    backgroundColor: "#2E2E2E",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 4,
    alignItems: "center",
  },
  metricValue: { color: "#F4F4F4", fontSize: 16, fontWeight: "700" },
  metricLabel: { color: "#A1A1AA", fontSize: 11, marginTop: 3 },
  trend: { color: "#A1A1AA", fontSize: 12, marginTop: 8 },
  menuList: { gap: 6 },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  menuName: { color: "#F4F4F4", fontSize: 13, flexShrink: 1 },
  menuValue: { color: "#A1A1AA", fontSize: 12 },
  menuOthers: { color: "#71717A", fontSize: 12, marginTop: 6 },
  goalList: { gap: 8 },
  goalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  goalTitle: { color: "#F4F4F4", fontSize: 13, flexShrink: 1, flexGrow: 1 },
  goalAchieved: {
    color: "#d08000",
    fontSize: 11,
    fontWeight: "700",
    backgroundColor: "rgba(208,128,0,0.2)",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    overflow: "hidden",
  },
  goalValue: { color: "#A1A1AA", fontSize: 12 },
  detail: { color: "#F4F4F4", fontSize: 13, lineHeight: 19 },
  insight: {
    color: "#F4F4F4",
    fontSize: 13,
    lineHeight: 19,
    fontStyle: "italic",
  },
});

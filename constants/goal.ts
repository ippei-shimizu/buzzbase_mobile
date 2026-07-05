import type { GoalComparison, GoalPeriodType } from "../types/goal";

/** 目標の種類（期間タイプ）の表示ラベル。 */
export const GOAL_PERIOD_LABELS: Record<GoalPeriodType, string> = {
  monthly: "月次",
  season: "シーズン",
  tournament: "大会",
};

/** 目標を種類別に並べるときの表示順。 */
export const GOAL_PERIOD_ORDER: GoalPeriodType[] = [
  "monthly",
  "season",
  "tournament",
];

export interface GoalMetric {
  key: string;
  label: string;
  unit: string;
  comparison: GoalComparison;
  decimal?: boolean;
}

// バックエンド Goal::METRIC_KEYS / MetricCalculator と対応（自動集計できる指標）。
export const GOAL_METRICS: GoalMetric[] = [
  // 練習・試合
  {
    key: "practice_days",
    label: "練習日数",
    unit: "日",
    comparison: "greater_than",
  },
  {
    key: "total_swing_count",
    label: "素振り本数",
    unit: "本",
    comparison: "greater_than",
  },
  {
    key: "game_count",
    label: "試合数",
    unit: "試合",
    comparison: "greater_than",
  },
  // 打撃
  {
    key: "batting_average",
    label: "打率",
    unit: "",
    comparison: "greater_than",
    decimal: true,
  },
  {
    key: "on_base_percentage",
    label: "出塁率",
    unit: "",
    comparison: "greater_than",
    decimal: true,
  },
  {
    key: "slugging_percentage",
    label: "長打率",
    unit: "",
    comparison: "greater_than",
    decimal: true,
  },
  {
    key: "ops",
    label: "OPS",
    unit: "",
    comparison: "greater_than",
    decimal: true,
  },
  { key: "hits", label: "安打", unit: "本", comparison: "greater_than" },
  { key: "home_runs", label: "本塁打", unit: "本", comparison: "greater_than" },
  {
    key: "runs_batted_in",
    label: "打点",
    unit: "点",
    comparison: "greater_than",
  },
  { key: "runs_scored", label: "得点", unit: "点", comparison: "greater_than" },
  {
    key: "stolen_bases",
    label: "盗塁",
    unit: "個",
    comparison: "greater_than",
  },
  // 投手
  {
    key: "era",
    label: "防御率",
    unit: "",
    comparison: "less_than",
    decimal: true,
  },
  {
    key: "whip",
    label: "WHIP",
    unit: "",
    comparison: "less_than",
    decimal: true,
  },
  {
    key: "strikeouts",
    label: "奪三振",
    unit: "個",
    comparison: "greater_than",
  },
  { key: "wins", label: "勝利", unit: "勝", comparison: "greater_than" },
  { key: "saves", label: "セーブ", unit: "個", comparison: "greater_than" },
];

export const metricLabel = (key: string): string =>
  GOAL_METRICS.find((metric) => metric.key === key)?.label ?? key;

export const formatMetricValue = (key: string, value: number): string => {
  const metric = GOAL_METRICS.find((item) => item.key === key);
  if (metric?.decimal) return value.toFixed(3).replace(/^0\./, ".");
  return String(Math.round(value));
};

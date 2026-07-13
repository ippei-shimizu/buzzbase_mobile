import type { GoalComparison, GoalPeriodType } from "../types/goal";

/** 目標の種類（期間タイプ）の表示ラベル。 */
export const GOAL_PERIOD_LABELS: Record<GoalPeriodType, string> = {
  weekly: "週次",
  monthly: "月次",
  yearly: "年間",
  custom: "カスタム期間",
  tournament: "大会",
  season: "シーズン",
};

/** 目標を種類別に並べるときの表示順。 */
export const GOAL_PERIOD_ORDER: GoalPeriodType[] = [
  "weekly",
  "monthly",
  "yearly",
  "custom",
  "tournament",
  "season",
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
    label: "出場試合数",
    unit: "試合",
    comparison: "greater_than",
  },
  {
    key: "menu_practice_days",
    label: "メニュー継続日数",
    unit: "日",
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

/** 数値目標タイトルのプレースホルダー例（指標別）。 */
const GOAL_METRIC_EXAMPLES: Record<string, string> = {
  practice_days: "例: 今月20日練習する",
  total_swing_count: "例: 今月2000本素振り",
  game_count: "例: 今シーズン15試合出場",
  menu_practice_days: "例: このメニューを20日継続",
  batting_average: "例: 打率.320を目指す",
  on_base_percentage: "例: 出塁率.400を目指す",
  slugging_percentage: "例: 長打率.500を目指す",
  ops: "例: OPS.850を目指す",
  hits: "例: 安打30本",
  home_runs: "例: 本塁打10本",
  runs_batted_in: "例: 打点20点",
  runs_scored: "例: 得点20点",
  stolen_bases: "例: 盗塁10個",
  era: "例: 防御率2.50以下",
  whip: "例: WHIP1.20以下",
  strikeouts: "例: 奪三振50個",
  wins: "例: 今シーズン5勝",
  saves: "例: 10セーブ",
};

export const metricExample = (key: string): string =>
  GOAL_METRIC_EXAMPLES[key] ?? "";

export type GoalMetricCategory = "practice" | "batting" | "pitching";

/** 指標選択のカテゴリ（表示順・見出し・所属キー）。 */
export const GOAL_METRIC_CATEGORIES: {
  key: GoalMetricCategory;
  label: string;
  keys: string[];
}[] = [
  {
    key: "practice",
    label: "練習・試合",
    keys: [
      "practice_days",
      "total_swing_count",
      "game_count",
      "menu_practice_days",
    ],
  },
  {
    key: "batting",
    label: "打撃",
    keys: [
      "batting_average",
      "on_base_percentage",
      "slugging_percentage",
      "ops",
      "hits",
      "home_runs",
      "runs_batted_in",
      "runs_scored",
      "stolen_bases",
    ],
  },
  {
    key: "pitching",
    label: "投手",
    keys: ["era", "whip", "strikeouts", "wins", "saves"],
  },
];

/** カテゴリの所属キーに対応する指標を GOAL_METRICS の順で返す。 */
export const metricsInCategory = (keys: string[]): GoalMetric[] =>
  GOAL_METRICS.filter((metric) => keys.includes(metric.key));

export const metricLabel = (key: string | null): string =>
  GOAL_METRICS.find((metric) => metric.key === key)?.label ?? key ?? "";

// 防御率・WHIP は 1 以上でも小数第2位まで見せたい（打率系と違い ".XXX" 表記の慣習が無いため）。
const TWO_DECIMAL_METRIC_KEYS = new Set(["era", "whip"]);

export const formatMetricValue = (
  key: string | null,
  value: number,
): string => {
  const metric = GOAL_METRICS.find((item) => item.key === key);
  if (!metric?.decimal) return String(Math.round(value));

  if (key != null && TWO_DECIMAL_METRIC_KEYS.has(key)) {
    return value.toFixed(2);
  }
  // 打率系は 1 未満なら .XXX（3桁）、1 以上（OPS 等）も 3桁小数のまま見せる。
  return Math.abs(value) < 1
    ? value.toFixed(3).replace(/^(-?)0\./, "$1.")
    : value.toFixed(3);
};

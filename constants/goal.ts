import type { GoalComparison } from "../types/goal";

export interface GoalMetric {
  key: string;
  label: string;
  unit: string;
  comparison: GoalComparison;
  decimal?: boolean;
}

export const GOAL_METRICS: GoalMetric[] = [
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
  {
    key: "batting_average",
    label: "打率",
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
  {
    key: "era",
    label: "防御率",
    unit: "",
    comparison: "less_than",
    decimal: true,
  },
];

export const metricLabel = (key: string): string =>
  GOAL_METRICS.find((metric) => metric.key === key)?.label ?? key;

export const formatMetricValue = (key: string, value: number): string => {
  const metric = GOAL_METRICS.find((item) => item.key === key);
  if (metric?.decimal) return value.toFixed(3).replace(/^0\./, ".");
  return String(Math.round(value));
};

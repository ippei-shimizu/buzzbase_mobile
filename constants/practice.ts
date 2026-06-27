import type { PracticeCategory, PracticeUnit } from "../types/practice";

export const PRACTICE_CATEGORIES: { key: PracticeCategory; label: string }[] = [
  { key: "batting", label: "バッティング" },
  { key: "pitching", label: "投手" },
  { key: "defense", label: "守備" },
  { key: "baserunning", label: "走塁" },
  { key: "training", label: "トレーニング" },
  { key: "other", label: "その他" },
];

export const PRACTICE_UNITS: {
  key: PracticeUnit;
  label: string;
  defaultLabel: string;
  placeholderValue: string;
}[] = [
  { key: "count", label: "回数", defaultLabel: "本", placeholderValue: "200" },
  { key: "minutes", label: "時間", defaultLabel: "分", placeholderValue: "30" },
  { key: "distance", label: "距離", defaultLabel: "km", placeholderValue: "5" },
];

export const CONDITION_MOODS = ["好調", "普通", "不調"];

export const INJURY_PARTS = [
  "肩",
  "肘",
  "手首",
  "腰",
  "股関節",
  "膝",
  "足首",
  "その他",
];

export const categoryLabel = (category: PracticeCategory): string =>
  PRACTICE_CATEGORIES.find((c) => c.key === category)?.label ?? category;

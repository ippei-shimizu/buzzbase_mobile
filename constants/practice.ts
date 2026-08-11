import type {
  PracticeCategory,
  PracticeLogSource,
  PracticeType,
  PracticeUnit,
} from "../types/practice";
import type { Ionicons } from "@expo/vector-icons";

type IoniconName = keyof typeof Ionicons.glyphMap;

// back/app/models/concerns/plan_limits.rb の PRACTICE_MENU_FREE_LIMIT と一致させる。
export const PRACTICE_MENU_FREE_LIMIT = 3;

export const PRACTICE_CATEGORIES: { key: PracticeCategory; label: string }[] = [
  { key: "batting", label: "バッティング" },
  { key: "pitching", label: "投手" },
  { key: "defense", label: "守備" },
  { key: "baserunning", label: "走塁" },
  { key: "training", label: "トレーニング" },
  { key: "strength", label: "筋トレ" },
  { key: "care", label: "ケア" },
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
  {
    key: "weight_reps",
    label: "重さ×回数",
    defaultLabel: "回",
    placeholderValue: "10",
  },
];

/** 筋トレ（重さ×回数）の計測かどうか。 */
export const isWeightReps = (unit: PracticeUnit): boolean =>
  unit === "weight_reps";

/**
 * 練習量を表示用に整形する。
 * weight_reps（筋トレ）は「60kg × 10回」、それ以外は「200本」のように返す。
 */
export const formatPracticeValue = (log: {
  amount: number | null;
  weight: number | null;
  unit_label: string | null;
}): string => {
  const reps = log.amount != null ? String(Number(log.amount)) : "";
  if (log.weight != null) {
    const weight = String(Number(log.weight));
    return `${weight}kg × ${reps || "0"}回`;
  }
  if (log.amount == null) return "";
  return `${reps}${log.unit_label ?? ""}`;
};

/** 積み上げの量を「12,400本」のように整形する。 */
export const formatTotalAmount = (
  amount: number,
  unitLabel: string | null,
): string => `${Number(amount).toLocaleString()}${unitLabel ?? ""}`;

/** 総挙上重量を「8.2t」「640kg」のように整形する。 */
export const formatVolume = (kg: number): string =>
  kg >= 1000
    ? `${(kg / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })}t`
    : `${Number(kg).toLocaleString()}kg`;

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

/** カテゴリごとの練習アイコン。一覧・詳細でメニューの種類を見分けやすくする。 */
export const CATEGORY_ICON: Record<PracticeCategory, IoniconName> = {
  batting: "baseball-outline",
  pitching: "hand-right-outline",
  defense: "shield-half-outline",
  baserunning: "walk-outline",
  training: "fitness-outline",
  strength: "barbell-outline",
  care: "bandage-outline",
  other: "ellipsis-horizontal-circle-outline",
};

/**
 * 練習ログのアイコンを決める。素振りは専用アイコン、それ以外はメニューのカテゴリで振り分ける。
 * category が不明（メニュー削除済みなど）の場合は「その他」のアイコンにフォールバックする。
 */
export const menuIconForLog = (
  source: PracticeLogSource,
  category: PracticeCategory | undefined,
): IoniconName => {
  if (source === "shadow_swing") return "baseball";
  return category ? CATEGORY_ICON[category] : CATEGORY_ICON.other;
};

/** 練習の種別（自主練習 / チーム練習）の表示ラベル。 */
export const PRACTICE_TYPE_LABELS: ReadonlyArray<{
  value: PracticeType;
  label: string;
}> = [
  { value: "self_practice", label: "自主練習" },
  { value: "team_practice", label: "チーム練習" },
];

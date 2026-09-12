/** 課題テーマのカテゴリ選択肢（back の ImprovementTheme::CATEGORIES と一致）。 */
export const THEME_CATEGORIES: { value: string; label: string }[] = [
  { value: "batting", label: "打撃" },
  { value: "pitching", label: "投球" },
  { value: "defense", label: "守備" },
  { value: "baserunning", label: "走塁" },
  { value: "training", label: "トレーニング" },
  { value: "strength", label: "筋トレ" },
  { value: "care", label: "ケア" },
  { value: "other", label: "その他" },
];

export const themeCategoryLabel = (value: string | null): string =>
  THEME_CATEGORIES.find((category) => category.value === value)?.label ??
  "その他";

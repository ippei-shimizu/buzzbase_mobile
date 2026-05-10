import type { AppearanceType } from "../types/gameRecord";

// 試合の出場区分（先発 / 途中出場 / 代打 / 代走 / 未出場）の表示ラベル単一ソース。
// フォーム選択肢や試合一覧バッジ等で参照する。

export const APPEARANCE_TYPE_LABELS: Readonly<Record<AppearanceType, string>> =
  {
    starter: "先発",
    substitute: "途中出場",
    pinch_hitter: "代打",
    pinch_runner: "代走",
    no_play: "未出場",
  };

export const APPEARANCE_TYPE_OPTIONS: readonly {
  value: AppearanceType;
  label: string;
}[] = [
  { value: "starter", label: APPEARANCE_TYPE_LABELS.starter },
  { value: "substitute", label: APPEARANCE_TYPE_LABELS.substitute },
  { value: "pinch_hitter", label: APPEARANCE_TYPE_LABELS.pinch_hitter },
  { value: "pinch_runner", label: APPEARANCE_TYPE_LABELS.pinch_runner },
  { value: "no_play", label: APPEARANCE_TYPE_LABELS.no_play },
];

// 試合一覧・詳細・サマリーで強調表示したい出場区分（先発以外の出場系）。
// "未出場" はバッジを出さない方針（試合に出ていないので試合バッジとして強調する意味が薄い）。
const HIGHLIGHTED_APPEARANCE_TYPES: readonly AppearanceType[] = [
  "substitute",
  "pinch_hitter",
  "pinch_runner",
];

/**
 * 試合一覧 / 詳細 / サマリーでバッジ表示すべき場合のラベルを返す。
 * 強調対象でない（先発・未出場・未指定）場合は null を返す。
 */
export const getAppearanceTypeBadgeLabel = (
  appearanceType?: AppearanceType | null,
): string | null => {
  if (!appearanceType) return null;
  if (!HIGHLIGHTED_APPEARANCE_TYPES.includes(appearanceType)) return null;
  return APPEARANCE_TYPE_LABELS[appearanceType];
};

/**
 * 打順／守備位置の入力を必須とすべき出場区分か（先発・途中出場のみ）。
 * フォームのバリデーションと必須ラベル表示で同じ判定を使うために集約している。
 */
export const isLineupRequired = (appearanceType: AppearanceType): boolean =>
  appearanceType === "starter" || appearanceType === "substitute";

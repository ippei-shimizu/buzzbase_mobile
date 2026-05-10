/**
 * 成績ラベルに紐づくツールチップ文言の単一ソース。
 *
 * 仕組み:
 *   - キーは画面に表示するラベル文字列そのもの（例: "防御率"、"K/9"）
 *   - 値は Modal/Popover に表示する説明文
 *
 * 新しい指標の説明を追加したい場合は、この Map に1行追加するだけで
 * SummaryStatsTable / stats/StatsTable / groups/GroupDetailStats など
 * `getStatTooltip(label)` を呼ぶ全ての成績表に自動で反映される。
 *
 * 同じラベルでもコンテキストごとに異なる説明を出したくなった場合は、
 * getStatTooltip にコンテキスト引数を足して分岐させる方針で拡張する想定。
 */

export const INNING_FORMAT_TOOLTIP =
  "試合のイニング制（7回制 or 9回制）に応じて計算されます。";

export const STAT_TOOLTIPS: Readonly<Record<string, string>> = {
  防御率: INNING_FORMAT_TOOLTIP,
  "K/9": INNING_FORMAT_TOOLTIP,
  "BB/9": INNING_FORMAT_TOOLTIP,
};

/**
 * 指定ラベルに紐づくツールチップ文言を返す。未登録なら undefined。
 *
 * @param label 画面に表示するラベル文字列
 */
export const getStatTooltip = (label: string): string | undefined =>
  STAT_TOOLTIPS[label];

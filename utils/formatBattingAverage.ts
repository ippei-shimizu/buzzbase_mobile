/**
 * 打率 / 長打率などの 0.XXX 形式の値を、野球慣用の「.XXX」表示文字列にする。
 *
 * - at_bats が 0 のとき: ".---" を返して未計算であることを明示する
 * - そうでないとき: 渡された比率を toFixed(3) で 3 桁に丸め、先頭 "0." を "." に置換
 *
 * @param ratio 比率（既にサーバ側で計算済みの batting_average / slugging_percentage 等）。
 *   省略時は hits/total を atBats で割った値を内部計算する。
 * @param atBats 母数（0 のときは ".---" を返すガード）
 *
 * @example
 *   formatBattingAverage(0.333, 6) // ".333"
 *   formatBattingAverage(0.0, 0)   // ".---"
 *   formatBattingAverage(1.0, 4)   // "1.000"
 */
export const formatBattingAverage = (ratio: number, atBats: number): string => {
  if (atBats === 0) return ".---";
  return ratio.toFixed(3).replace(/^0\./, ".");
};

/**
 * 分子・分母から打率を計算してフォーマットする。`formatBattingAverage` の薄いラッパー。
 * 主に hits/total_bases を at_bats で割って表示するケースで使う。
 */
export const formatRateFromCounts = (
  numerator: number,
  denominator: number,
): string => {
  if (denominator === 0) return ".---";
  return formatBattingAverage(numerator / denominator, denominator);
};

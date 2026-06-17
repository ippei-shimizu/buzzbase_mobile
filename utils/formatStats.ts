/**
 * 率系の成績値（打率・出塁率・OPS等）をフォーマットする
 * 1未満の場合は先頭の0を除去（例: 0.583 → .583）
 */
export function formatRate(value: number): string {
  const formatted = value.toFixed(3);
  if (value !== 0 && value < 1 && value > -1) {
    return formatted.replace(/^0/, "");
  }
  return formatted;
}

/**
 * 勝率など小数2桁の率系成績値をフォーマットする
 * 1未満の場合は先頭の0を除去（例: 0.67 → .67）
 */
export function formatRate2(value: number): string {
  const formatted = value.toFixed(2);
  if (value !== 0 && value < 1 && value > -1) {
    return formatted.replace(/^0/, "");
  }
  return formatted;
}

/**
 * 防御率・WHIP・K/9等の投手指標をフォーマットする
 * 先頭の0を除去しない（例: 0.50 → 0.50）
 */
export function formatEra(value: number): string {
  return value.toFixed(2);
}

/**
 * 母数 0 のとき ".---" を返す野球向け率系フォーマッタ。
 *
 * 打率 / 出塁率 / 長打率 / OPS など、計算分母が 0 の場合に未計算であることを
 * 明示したいケースで使う。`formatBattingAverage` の第 2 引数は "atBats" に
 * 名前が固定されているが、こちらは汎用的に出塁率の OBP 分母 (AB+BB+HBP+SF)
 * など任意の denominator を渡せる。
 *
 * @example
 *   formatStatRate(0.333, 6)  // ".333"
 *   formatStatRate(0.0, 0)    // ".---"
 *   formatStatRate(1.667, 5)  // "1.667"
 */
export function formatStatRate(value: number, denominator: number): string {
  if (denominator <= 0) return ".---";
  return value.toFixed(3).replace(/^0\./, ".");
}

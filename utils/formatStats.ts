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

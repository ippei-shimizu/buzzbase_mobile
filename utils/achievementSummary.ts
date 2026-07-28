const pad = (value: number): string => String(value).padStart(2, "0");

/** 直近の「完了した月」のキー(YYYY-MM)。今月はまだ終わっていないため対象外。 */
export const previousMonthKey = (now: Date = new Date()): string => {
  const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
  const month = now.getMonth() === 0 ? 12 : now.getMonth();
  return `${year}-${pad(month)}`;
};

/** ISO日付文字列(YYYY-MM-DD)が指定した月キー(YYYY-MM)に属するか。 */
export const isDateInMonth = (iso: string, monthKey: string): boolean =>
  iso.startsWith(`${monthKey}-`);

/** 月キー(YYYY-MM)を日本語表示("YYYY年M月")に変換する。 */
export const formatMonthKeyJa = (monthKey: string): string => {
  const [year, month] = monthKey.split("-").map(Number);
  return `${year}年${month}月`;
};

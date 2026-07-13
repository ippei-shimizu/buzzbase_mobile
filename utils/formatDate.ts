/**
 * "YYYY-MM-DD" を "YYYY年M月D日" 表記に変換する。
 * 月・日はゼロ埋めしない。パースできない文字列はそのまま返す。
 */
export const formatJaFullDate = (iso: string): string => {
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return iso;
  return `${year}年${month}月${day}日`;
};

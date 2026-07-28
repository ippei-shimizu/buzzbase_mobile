const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

/**
 * "YYYY-MM-DD" を "YYYY年M月D日" 表記に変換する。
 * 月・日はゼロ埋めしない。パースできない文字列はそのまま返す。
 */
export const formatJaFullDate = (iso: string): string => {
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return iso;
  return `${year}年${month}月${day}日`;
};

/** "YYYY-MM-DD" を "YYYY年M月D日(曜)" 表記に変換する。パースできない文字列はそのまま返す。 */
export const formatJaFullDateWithWeekday = (iso: string): string => {
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return iso;
  const weekday = WEEKDAY_LABELS[new Date(year, month - 1, day).getDay()];
  return `${year}年${month}月${day}日(${weekday})`;
};

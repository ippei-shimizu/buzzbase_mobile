// 予定・カレンダーで使う日付ヘルパー。端末ローカルタイムの YYYY-MM-DD を扱う。
// スケジュールは端末上の「今日」を基準に判定するため UTC ではなくローカルで計算する。

const pad = (value: number): string => String(value).padStart(2, "0");

/** Date をローカルタイムの "YYYY-MM-DD" に整形する。 */
export const toIsoDate = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/** 端末の今日を "YYYY-MM-DD" で返す。 */
export const todayIso = (): string => toIsoDate(new Date());

/** "YYYY-MM-DD" をローカルタイムの Date（00:00）に戻す。 */
export const fromIsoDate = (iso: string): Date => {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
};

/** 月=1〜日=7 の曜日番号。JS の getDay()（0=日）を変換する。 */
export const weekdayNumber = (date: Date): number => {
  const day = date.getDay();
  return day === 0 ? 7 : day;
};

const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

/** "2026-07-05" → "7/5(土)" のような短い表示。 */
export const formatMonthDay = (iso: string): string => {
  const date = fromIsoDate(iso);
  return `${date.getMonth() + 1}/${date.getDate()}(${WEEKDAY_LABELS[date.getDay()]})`;
};

/** iso の日付に days を足した "YYYY-MM-DD" を返す。 */
export const addDays = (iso: string, days: number): string => {
  const date = fromIsoDate(iso);
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
};

/** iso を含む週の月曜日を返す（週の起点を月曜に統一）。 */
export const mondayOf = (iso: string): string => {
  const date = fromIsoDate(iso);
  const offset = weekdayNumber(date) - 1;
  return addDays(iso, -offset);
};

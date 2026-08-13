// バックエンド Schedule::NOTE_MAX_LENGTH と一致させる。
export const SCHEDULE_NOTE_MAX_LENGTH = 2000;

import type { EventType } from "../types/schedule";

export const WEEK_DAYS: { num: number; label: string }[] = [
  { num: 1, label: "月" },
  { num: 2, label: "火" },
  { num: 3, label: "水" },
  { num: 4, label: "木" },
  { num: 5, label: "金" },
  { num: 6, label: "土" },
  { num: 7, label: "日" },
];

export const dayLabels = (daysOfWeek: string): string =>
  daysOfWeek
    .split(",")
    .map(
      (value) =>
        WEEK_DAYS.find((day) => day.num === Number(value))?.label ?? "",
    )
    .join("・");

export const EVENT_TYPES: {
  value: EventType;
  label: string;
  color: string;
}[] = [
  { value: "self_practice", label: "自主練", color: "#4a8e32" },
  { value: "practice", label: "チーム練習", color: "#3B82F6" },
  { value: "game", label: "試合", color: "#EF4444" },
  { value: "other", label: "その他", color: "#52525B" },
];

export const eventTypeMeta = (value: EventType) =>
  EVENT_TYPES.find((event) => event.value === value) ?? EVENT_TYPES[0];

/**
 * 時刻の表示文字列。終了時刻があれば「開始〜終了」で返す。
 * 開始時刻が無い（終日）場合は null。
 */
export const scheduleTimeLabel = (
  scheduledTime: string | null,
  endTime: string | null,
): string | null => {
  if (!scheduledTime) return null;
  return endTime ? `${scheduledTime}〜${endTime}` : scheduledTime;
};

export type EventType = "self_practice" | "practice" | "game" | "other";

export interface ScheduleMenu {
  practice_menu_id: number;
  name: string | null;
  unit_label: string | null;
  target_value: number | null;
}

export interface Schedule {
  id: number;
  title: string | null;
  days_of_week: string | null; // "1,3,5"（月=1〜日=7）。単発の場合 null
  planned_on: string | null; // "2026-07-11"。繰り返しの場合 null
  scheduled_time: string | null; // "06:00"。終日予定は null
  event_type: EventType;
  recurring: boolean; // days_of_week を持つ（繰り返し）か
  menu_set_id: number | null;
  game_result_id: number | null;
  note: string | null;
  notification_enabled: boolean;
  active: boolean;
  notification_message: string | null;
  menus: ScheduleMenu[];
}

export interface ScheduleInput {
  title?: string | null;
  days_of_week?: string | null;
  planned_on?: string | null;
  scheduled_time?: string | null;
  event_type?: EventType;
  menu_set_id?: number | null;
  notification_enabled?: boolean;
  notification_message?: string | null;
  menus?: { practice_menu_id: number; target_value?: number | null }[];
}

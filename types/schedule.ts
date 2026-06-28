export interface ScheduleMenu {
  practice_menu_id: number;
  name: string | null;
  unit_label: string | null;
  target_value: number | null;
}

export interface Schedule {
  id: number;
  title: string;
  days_of_week: string; // "1,3,5"（月=1〜日=7）
  scheduled_time: string; // "06:00"
  note: string | null;
  notification_enabled: boolean;
  active: boolean;
  notification_message: string | null;
  menus: ScheduleMenu[];
}

export interface ScheduleInput {
  title: string;
  days_of_week: string;
  scheduled_time: string;
  notification_enabled?: boolean;
  notification_message?: string | null;
  menus?: { practice_menu_id: number; target_value?: number | null }[];
}

import type { EventType } from "./schedule";

export interface PlanMenu {
  practice_menu_id: number;
  name: string | null;
  unit_label: string | null;
  target_value: number | null;
  sort_order: number;
  done: boolean; // その日に同メニューの練習ログがあるか
}

/** 特定日に展開された予定（schedule）。「今日のやること」の 1 行に対応する。 */
export interface Plan {
  id: number;
  title: string | null;
  event_type: EventType;
  scheduled_time: string | null;
  end_time: string | null;
  recurring: boolean;
  menu_set_id: number | null;
  game_result_id: number | null;
  note: string | null;
  menus: PlanMenu[];
  done: boolean; // 予定内の全メニューが当日ログ済みか
}

export interface CalendarEntry {
  date: string; // "2026-07-06"
  event_type: EventType;
  title: string | null;
  schedule_id: number;
  scheduled_time: string | null; // "06:00"。終日・時間未設定は null
  end_time: string | null; // "12:30"。未設定は null
}

export interface CalendarResponse {
  entries: CalendarEntry[];
}

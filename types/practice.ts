export type PracticeCategory =
  | "batting"
  | "pitching"
  | "defense"
  | "baserunning"
  | "training"
  | "other";

export type PracticeUnit = "count" | "minutes" | "distance";

export type PracticeLogSource = "manual" | "shadow_swing";

export interface PracticeMenu {
  id: number;
  name: string;
  category: PracticeCategory;
  unit: PracticeUnit;
  unit_label: string | null;
  default_value: number | null;
  is_favorite: boolean;
  sort_order: number;
}

export interface PracticeLog {
  id: number;
  practice_menu_id: number | null;
  logged_on: string;
  amount: number | null;
  menu_name: string;
  unit_label: string | null;
  source: PracticeLogSource;
  memo: string | null;
  created_at: string;
}

export interface Injury {
  part: string;
  memo?: string;
}

export interface ConditionLog {
  id: number;
  logged_on: string;
  fatigue_level: number | null;
  physical_level: number | null;
  sleep_hours: number | null;
  mood: string | null;
  memo: string | null;
  injuries: Injury[];
}

export interface PracticeMenuInput {
  name: string;
  category: PracticeCategory;
  unit: PracticeUnit;
  unit_label?: string;
  default_value?: number | null;
  is_favorite?: boolean;
}

export interface PracticeLogInput {
  practice_menu_id: number;
  logged_on: string;
  amount?: number | null;
  memo?: string | null;
}

export interface ConditionLogInput {
  logged_on: string;
  fatigue_level?: number | null;
  physical_level?: number | null;
  sleep_hours?: number | null;
  mood?: string | null;
  memo?: string | null;
  injuries?: Injury[];
}

export type PracticeCategory =
  | "batting"
  | "pitching"
  | "defense"
  | "baserunning"
  | "training"
  | "strength"
  | "care"
  | "other";

export type PracticeUnit = "count" | "minutes" | "distance" | "weight_reps";

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
  weight: number | null;
  menu_name: string;
  unit_label: string | null;
  source: PracticeLogSource;
  memo: string | null;
  created_at: string;
}

/** メニュー別の積み上げサマリー。 */
export interface MenuSummary {
  practice_menu_id: number | null;
  menu_name: string;
  unit: PracticeUnit;
  unit_label: string | null;
  total_amount: number;
  total_volume: number | null;
  this_month_amount: number;
  this_month_volume: number | null;
  days_count: number;
  last_logged_on: string | null;
}

/** 練習全体のKPI。 */
export interface PracticeOverview {
  total_practice_days: number;
  this_month_practice_days: number;
  total_swing_count: number;
  total_volume: number;
  total_menus: number;
}

export interface MenuTrendMonth {
  month: string;
  total_amount: number;
  total_volume: number;
  max_weight: number | null;
  days_count: number;
}

/** 単一メニューの推移・自己ベスト・履歴。 */
export interface MenuTrend {
  menu: {
    id: number;
    name: string;
    unit: PracticeUnit;
    unit_label: string | null;
    is_weight_reps: boolean;
  };
  monthly: MenuTrendMonth[];
  best: { max_amount: number | null; max_weight: number | null };
  recent: {
    id: number;
    logged_on: string;
    amount: number | null;
    weight: number | null;
  }[];
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

/** 日次の練習セッション。1日（logged_on）の量ログとコンディションを束ねる。 */
export interface PracticeSession {
  id: number;
  logged_on: string;
  memo: string | null;
  practice_logs: PracticeLog[];
  condition: ConditionLog | null;
  created_at: string;
}

/** セッション保存時の1メニュー項目。 */
export interface PracticeSessionItemInput {
  practice_menu_id: number;
  amount?: number | null;
  weight?: number | null;
  memo?: string | null;
}

/** コンディションは logged_on をセッションの日付から決めるため省く。 */
export type ConditionInput = Omit<ConditionLogInput, "logged_on">;

export interface PracticeSessionInput {
  logged_on: string;
  memo?: string | null;
  items: PracticeSessionItemInput[];
  condition?: ConditionInput | null;
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

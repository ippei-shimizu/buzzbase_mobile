import type { CorrelationInsight } from "./insight";

export type PeriodicReviewType = "weekly" | "monthly";

export interface PeriodicReviewThemeBreakdown {
  id: number;
  title: string;
  practice_count: number;
}

/** 得点圏成績。runners_state 必須の新フォーマット打席のみが母数で、母数 0 なら打率 null。 */
export interface PeriodicReviewScoringPosition {
  batting_average: number | null;
  at_bats: number;
  hits: number;
}

/** メニュー別の練習量内訳1件。削除済みメニューは menu_name のスナップショットで名寄せされる。 */
export interface PeriodicReviewPracticeMenu {
  name: string;
  count: number;
  total_amount: number;
  unit_label: string | null;
}

export interface PeriodicReviewPracticeMenus {
  items: PeriodicReviewPracticeMenu[];
  // 上位表示から漏れたメニュー数（back 側で上限に丸めた残り）。
  other_count: number;
}

/** 期間に重なる目標の進捗スナップショット。kind で current_value の意味が変わる。 */
export interface PeriodicReviewGoal {
  id: number;
  title: string;
  kind: "numeric" | "qualitative" | "manual";
  metric_key: string | null;
  custom_metric_label: string | null;
  current_value: number | null;
  target_value: number | null;
  progress_percent: number | null;
  achieved: boolean;
  deadline: string;
}

export interface PeriodicReviewSummary {
  period_type: PeriodicReviewType;
  practice_days: number;
  total_swings: number;
  active_days: number;
  streak_current: number;
  // 以下は Pro のみ返る詳細部（無料では欠落する）。
  theme_breakdown?: PeriodicReviewThemeBreakdown[];
  condition?: {
    sleep_hours_avg: number | null;
    fatigue_level_avg: number | null;
    physical_level_avg?: number | null;
  };
  practice_menus?: PeriodicReviewPracticeMenus;
  note_days?: number;
  goals?: PeriodicReviewGoal[];
  // 成績（打撃・投手）は全ユーザーに返る。登板が無い期間は投手各値が null。
  // 旧レポート（新指標追加前に生成された summary）にはキー自体が無いことがあるため任意にする。
  batting?: {
    batting_average: number;
    on_base_percentage?: number;
    slugging_percentage?: number;
    ops?: number;
    previous_batting_average?: number;
    delta?: number;
    hits?: number;
    two_base_hits?: number;
    three_base_hits?: number;
    home_runs?: number;
    stolen_bases?: number;
    strikeouts?: number;
    scoring_position?: PeriodicReviewScoringPosition;
  };
  pitching?: {
    appearances?: number;
    innings_pitched: number;
    era: number | null;
    whip: number | null;
    k_per_9: number | null;
    strikeouts?: number;
    base_on_balls?: number;
    hit_by_pitch?: number;
    hits_allowed?: number;
    home_runs_allowed?: number;
    runs_allowed?: number;
    earned_runs?: number;
  };
  // 以下は Pro のみ返る詳細部。
  insight?: CorrelationInsight | null;
}

export interface PeriodicReview {
  id: number;
  period_type: PeriodicReviewType;
  period_start: string;
  period_end: string;
  read: boolean;
  summary: PeriodicReviewSummary;
}

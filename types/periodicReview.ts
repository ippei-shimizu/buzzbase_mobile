import type { CorrelationInsight } from "./insight";

export type PeriodicReviewType = "weekly" | "monthly";

export interface PeriodicReviewThemeBreakdown {
  id: number;
  title: string;
  practice_count: number;
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
  };
  // 成績（打撃・投手）は全ユーザーに返る。登板が無い期間は投手各値が null。
  // 旧レポート（新指標追加前に生成された summary）にはキー自体が無いことがあるため任意にする。
  batting?: {
    batting_average: number;
    on_base_percentage?: number;
    slugging_percentage?: number;
    ops?: number;
    previous_batting_average?: number;
    delta?: number;
  };
  pitching?: {
    innings_pitched: number;
    era: number | null;
    whip: number | null;
    k_per_9: number | null;
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

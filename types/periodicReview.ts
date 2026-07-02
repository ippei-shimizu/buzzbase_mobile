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
  batting?: {
    batting_average: number;
    previous_batting_average: number;
    delta: number;
  };
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

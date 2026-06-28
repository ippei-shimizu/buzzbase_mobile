export type GoalPeriodType = "season" | "monthly" | "tournament";
export type GoalComparison = "greater_than" | "less_than";

export interface Goal {
  id: number;
  title: string;
  period_type: GoalPeriodType;
  season_id: number | null;
  tournament_id: number | null;
  month_start: string | null;
  deadline: string;
  metric_key: string;
  target_value: number;
  comparison_type: GoalComparison;
  is_achieved: boolean;
  is_finalized: boolean;
  achieved_value: number | null;
  current_value: number;
  progress_percent: number;
  days_remaining: number;
}

export interface GoalInput {
  title: string;
  period_type: GoalPeriodType;
  season_id?: number | null;
  tournament_id?: number | null;
  month_start?: string | null;
  deadline: string;
  metric_key: string;
  target_value: number;
  comparison_type: GoalComparison;
}

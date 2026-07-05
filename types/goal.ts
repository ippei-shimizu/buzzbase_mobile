export type GoalPeriodType = "season" | "monthly" | "tournament";
export type GoalComparison = "greater_than" | "less_than";
/** numeric: 指標を自動集計する数値目標 / qualitative: 達成・未達で管理する定性目標。 */
export type GoalKind = "numeric" | "qualitative";

export interface Goal {
  id: number;
  title: string;
  kind: GoalKind;
  period_type: GoalPeriodType;
  season_id: number | null;
  tournament_id: number | null;
  month_start: string | null;
  deadline: string;
  metric_key: string | null;
  target_value: number | null;
  comparison_type: GoalComparison;
  practice_menu_id: number | null;
  practice_menu_name: string | null;
  is_achieved: boolean;
  is_finalized: boolean;
  achieved_value: number | null;
  current_value: number;
  progress_percent: number;
  days_remaining: number;
}

export interface GoalInput {
  title: string;
  kind: GoalKind;
  period_type: GoalPeriodType;
  season_id?: number | null;
  tournament_id?: number | null;
  month_start?: string | null;
  deadline: string;
  metric_key?: string | null;
  target_value?: number | null;
  comparison_type?: GoalComparison;
  practice_menu_id?: number | null;
}

export type ImprovementThemeStatus = "open" | "achieved" | "archived";

export interface ImprovementTheme {
  id: number;
  title: string;
  category: string | null;
  purpose: string | null;
  status: ImprovementThemeStatus;
  started_on: string;
  achieved_on: string | null;
  sort_order: number;
  practice_logs_count: number;
  notes_count: number;
  active_days: number;
  created_at: string;
}

export interface ImprovementThemeInput {
  title?: string;
  category?: string | null;
  purpose?: string | null;
  status?: ImprovementThemeStatus;
  achieved_on?: string | null;
  sort_order?: number;
}

export interface ShadowSwingSession {
  id: number;
  logged_on: string;
  target_count: number;
  swing_count: number;
  completed_at: string | null;
  practice_log_id: number | null;
}

export interface ShadowSwingStats {
  today_count: number;
  month_count: number;
  total_count: number;
}

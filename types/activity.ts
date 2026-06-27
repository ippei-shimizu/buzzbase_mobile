export interface ActivityLog {
  activity_date: string;
  intensity_level: number; // 0-4
  has_game: boolean;
  total_swing_count: number;
  practice_menu_count: number;
}

export interface HeatmapResponse {
  from: string;
  to: string;
  current_streak_days: number;
  longest_streak_days: number;
  total_active_days: number;
  data: ActivityLog[];
}

export interface StreakSummary {
  current_streak_days: number;
  longest_streak_days: number;
  total_active_days: number;
}

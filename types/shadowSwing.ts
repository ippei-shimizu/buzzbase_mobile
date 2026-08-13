export interface ShadowSwingSession {
  id: number;
  logged_on: string;
  target_count: number;
  swing_count: number;
  completed_at: string | null;
  practice_log_id: number | null;
  interval_seconds: number;
  vibration_enabled: boolean;
  sound_enabled: boolean;
  voice_enabled: boolean;
}

/** セッション開始時にサーバーへ送る設定。Pro 限定値はサーバー側で検証される。 */
export interface ShadowSwingSessionInput {
  target_count: number;
  interval_seconds: number;
  vibration_enabled: boolean;
  sound_enabled: boolean;
  voice_enabled: boolean;
}

export interface ShadowSwingStats {
  today_count: number;
  month_count: number;
  total_count: number;
}

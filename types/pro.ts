/**
 * Pro 加入状態と Entitlement の型定義。
 * back/app/models/concerns/entitlement.rb の定数と一致させる必要がある。
 * 同期の自動化は将来 Issue で対応する（現状は手動同期）。
 */

// 無料プランで利用可能な機能キー。Pro 加入の有無に関わらず常に許可される。
export const FREE_FEATURES = [
  "basic_game_record", // 試合記録(基本): 試合結果・打撃成績の入力と表示
  "basic_stats", // 基本成績集計: 打率・防御率などの基本指標
  "group_ranking", // グループ内ランキング機能
  "calculation_tools", // 打率・防御率などの計算ツール
  "baseball_note_basic", // 野球ノート(基本): 練習・試合の振り返りメモ
  "shadow_swing_basic", // 素振りカウンター(基本): スイング回数の記録
  "practice_log_basic", // 練習記録(基本): 練習内容のログ
  "grass_recent_30days", // 草機能: 直近30日分のヒートマップ表示
  "monthly_goal_single", // 月次目標: 1つまで作成可
  "schedule_single", // 自主練スケジュール: 1つまで作成可
] as const;

// Pro 加入時のみ利用可能な機能キー。subscription.entitlements に含まれていれば許可。
export const PRO_FEATURES = [
  "no_ads", // 広告非表示
  "season_transition_graph", // シーズン跨ぎ成績推移グラフ(複数シーズン比較)
  "grass_full_history", // 草機能: 全期間ヒートマップ表示
  "unlimited_practice_menus", // 練習メニュー無制限(無料は3件まで)
  "unlimited_media_uploads", // 動画・画像アップロード無制限(無料は月3件)
  "media_long_term_storage", // メディア長期保管(31日以上前も閲覧可)
  "unlimited_schedules", // 自主練スケジュール無制限(無料は1件まで)
  "unlimited_monthly_goals", // 月次目標無制限(無料は1件まで)
  "season_goals", // シーズン目標(無料は利用不可)
  "custom_notification_messages", // カスタム通知メッセージの設定
  "advanced_goal_tracking", // 高度な目標トラッキング(達成率の詳細推移)
  "detailed_condition_log", // 詳細コンディションログ(体調・気分の詳細記録)
] as const;

export type FreeFeature = (typeof FREE_FEATURES)[number];
export type ProFeature = (typeof PRO_FEATURES)[number];
export type Feature = FreeFeature | ProFeature;

export type SubscriptionStatus =
  | "free"
  | "trial"
  | "active"
  | "cancelled"
  | "billing_issue"
  | "expired"
  | "pending";

export type PlanType = "monthly" | "yearly";
export type Platform = "ios" | "web" | "android";

export interface ProSubscription {
  status: SubscriptionStatus;
  plan_type: PlanType | null;
  platform: Platform | null;
  started_at: string | null;
  expires_at: string | null;
  in_trial: boolean;
  in_grace_period: boolean;
  days_remaining: number | null;
  is_early_subscriber: boolean;
  has_used_trial: boolean;
}

export interface ProStatus {
  subscription: ProSubscription;
  entitlements: string[];
}

export interface EntitlementCheck {
  key: Feature;
  granted: boolean;
}

export interface EntitlementsResponse {
  entitlements: EntitlementCheck[];
}

// 未認証や API 失敗時のフォールバック値。
export const DEFAULT_PRO_STATUS: ProStatus = {
  subscription: {
    status: "free",
    plan_type: null,
    platform: null,
    started_at: null,
    expires_at: null,
    in_trial: false,
    in_grace_period: false,
    days_remaining: null,
    is_early_subscriber: false,
    has_used_trial: false,
  },
  entitlements: [...FREE_FEATURES],
};

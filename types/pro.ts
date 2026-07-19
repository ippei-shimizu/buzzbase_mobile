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
  "monthly_goal_single", // 個人の期間目標（月次/週次/年間/カスタム）: 2つまで作成可
  "schedule_single", // 自主練スケジュール: 無料でも無制限に作成可
] as const;

// Pro 加入時のみ利用可能な機能キー。subscription.entitlements に含まれていれば許可。
export const PRO_FEATURES = [
  "no_ads", // 広告非表示
  "season_transition_graph", // シーズン跨ぎ成績推移グラフ(複数シーズン比較)
  "grass_full_history", // 草機能: 全期間ヒートマップ表示
  "unlimited_practice_menus", // 練習メニュー無制限(無料は3件まで)
  "unlimited_media_uploads", // 動画・画像アップロード無制限(無料は月3件)
  "media_long_term_storage", // メディア長期保管(31日以上前も閲覧可)
  "schedule_copy_next_week", // 週の練習プランを来週へ一括コピー
  "unlimited_menu_sets", // メニューセット無制限(無料は2件まで)
  "unlimited_monthly_goals", // 個人の期間目標無制限(無料は2件まで)
  "season_goals", // シーズン目標(無料は利用不可)
  "tournament_goals", // 大会目標(無料は利用不可)
  "custom_notification_messages", // カスタム通知メッセージの設定
  "advanced_goal_tracking", // 高度な目標トラッキング(達成率の詳細推移)
  "detailed_condition_log", // 詳細コンディションログ(体調・気分の詳細記録)
  "unlimited_improvement_themes", // 課題テーマ無制限(無料は取組中2つまで)
  "correlation_insights", // 相関インサイト(練習量・コンディション×成績の傾向)
  "unlimited_reflection_templates", // 振り返りテンプレの自作無制限(無料は1つまで・プリセットは全員可)
  "advanced_periodic_review", // 週次/月次レポートの詳細(課題別内訳・相関・成績前週比・月次)
  "note_tags", // 野球ノートへのタグ付け(無料は付与不可)
  "multi_game_result_notes", // 野球ノートへの複数試合記録紐付け(無料は1件まで)
  "multi_improvement_theme_links", // 練習記録・野球ノートへの複数課題紐付け(無料は1件まで)
  "practice_menu_trend_detail", // メニューごとの推移詳細(期間フィルタ・グラフ・数値内訳)
  "custom_period_goals", // カスタム期間の個人目標(無料は利用不可)
  "manual_metric_goals", // 自由指標(手動更新)の目標設定(無料は利用不可)
  "shadow_swing_custom_interval", // 素振りカウンターのインターバル自由設定(無料は5〜10秒のみ)
  "shadow_swing_vibration", // 素振りカウンターのバイブレーション設定(無料は利用不可)
  "unlimited_groups", // グループ作成・参加を無制限に(無料は所属1件まで)
  "hit_direction_average", // 方向別の打率(打球方向ごとのヒートマップ)
  "count_situation_average", // カウント別の打率(初球・有利・追い込み等)
  "pitch_type_average", // 球種別の打率(ストレート・変化球等)
  "pitcher_faceoff_average", // 対戦投手別の打撃成績
] as const;

export type FreeFeature = (typeof FREE_FEATURES)[number];
export type ProFeature = (typeof PRO_FEATURES)[number];
export type Feature = FreeFeature | ProFeature;

// 各 status の意味:
// - free:          一度も加入していない、または完全期限切れ後
// - trial:         トライアル期間中（期限内なら pro_active=true）
// - active:        通常課金中（期限内なら pro_active=true）
// - cancelled:     解約申請済み・期限まで利用可（期限内なら pro_active=true）
// - billing_issue: 課金失敗中の Grace Period（期限内なら pro_active=true）
// - expired:       期限切れ・Pro 機能不可（pro_active=false）
// - pending:       課金処理中の遷移状態・Pro 機能はまだ不可（pro_active=false）
// クライアントは status を直接見ず、サーバー算出済みの pro_active を真実とする。
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
  // Server 側で期限と status を合わせて判定した Pro 加入可否。
  // クライアントはこれを単一の真実として参照する（status からの再計算は不要）。
  pro_active: boolean;
  in_trial: boolean;
  in_grace_period: boolean;
  days_remaining: number | null;
  is_early_subscriber: boolean;
  has_used_trial: boolean;
}

export interface ProStatus {
  subscription: ProSubscription;
  entitlements: Feature[];
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
    pro_active: false,
    in_trial: false,
    in_grace_period: false,
    days_remaining: null,
    is_early_subscriber: false,
    has_used_trial: false,
  },
  entitlements: [...FREE_FEATURES] as Feature[],
};

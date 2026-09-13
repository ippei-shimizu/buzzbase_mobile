import type { GoalKind, GoalPeriodType } from "../types/goal";
import type { PlanType, Platform, ProFeature } from "../types/pro";
import type { EventType } from "../types/schedule";
import type { BattingTrendGranularity } from "../types/stats";
import { posthog } from "@utils/posthog";

/**
 * PostHog コンバージョンイベントの送信関数群。
 *
 * イベント名・プロパティを一元管理してタイポを防ぐため、各画面/フックは
 * posthog.capture を直接呼ばずこのモジュール経由で計測する。
 * イベント名は object-verb（PostHog 慣例）。posthog?. により開発ビルドと
 * キー未設定時は no-op。
 */
type LoginType = "email" | "google" | "apple";

/**
 * Pro 訴求（Paywall / ロックカード / 上限到達）の起点となった機能キー。
 * `PRO_FEATURES` の正式キーに揃える。LP の CTA など特定機能に紐づかない導線は "general"。
 */
export type ProTrigger = ProFeature | "general";

export const trackSignUpCompleted = (loginType: LoginType) =>
  posthog?.capture("sign up completed", { login_type: loginType });

export const trackUserLoggedIn = (loginType: LoginType) =>
  posthog?.capture("user logged in", { login_type: loginType });

export const trackGameRecordStepViewed = (step: 1 | 2 | 3 | "summary") =>
  posthog?.capture("game record step viewed", { step });

export const trackGameRecordCompleted = (props: {
  match_type: string | null;
  appearance_type: string;
  has_pitching: boolean;
}) => posthog?.capture("game record completed", props);

export const trackGroupCreated = (groupId: number) =>
  posthog?.capture("group created", { group_id: groupId });

export const trackGroupJoined = (groupId: number) =>
  posthog?.capture("group joined", { group_id: groupId });

export const trackUserFollowed = (followedUserId: number) =>
  posthog?.capture("user followed", { followed_user_id: followedUserId });

export const trackProfileUpdated = () => posthog?.capture("profile updated");

/**
 * 打席記録ウィザードの作成 / 更新完了。`is_edit` で新規・編集を区別する。
 * `has_pitcher` / `has_detail` は任意の詳細入力がどれだけ使われたかの計測用。
 */
export const trackPlateAppearanceCompleted = (props: {
  is_edit: boolean;
  has_pitcher: boolean;
  has_detail: boolean;
}) => posthog?.capture("plate appearance completed", props);

/** 打席記録ウィザードの途中離脱（完了せずに画面を離れた）。 */
export const trackPlateAppearanceCanceled = (props: { is_edit: boolean }) =>
  posthog?.capture("plate appearance canceled", props);

/** 打撃分析 stats のフィルター変更。どの絞り込みが使われるかの計測用。 */
export const trackStatsFilterChanged = (props: {
  filter_key: string;
  filter_value: string | null;
}) => posthog?.capture("stats filter changed", props);

/** 打撃成績推移グラフの粒度切替（試合 / 月 / 年 / 直近10）。 */
export const trackBattingTrendGranularityChanged = (
  granularity: BattingTrendGranularity,
) => posthog?.capture("batting trend granularity changed", { granularity });

/**
 * Pro 訴求（ロックカード / Paywall 導線）のタップ。課金意向シグナルとして計測する。
 * `feature` は `PRO_FEATURES` の正式キーに揃える（略称を混ぜると集計が分裂する）。
 */
export const trackProFeatureTapped = (feature: ProTrigger) =>
  posthog?.capture("pro feature tapped", { feature });

export const trackGoalCreated = (props: {
  period_type: GoalPeriodType;
  kind: GoalKind;
}) => posthog?.capture("goal created", props);

/**
 * 練習記録（日次）の保存完了。サーバー側は日付キーの upsert のため、同じ日を
 * 編集し直すと再送される。集計はユニークユーザー数で見る前提。
 */
export const trackPracticeRecordCreated = (props: {
  menu_count: number;
  has_condition: boolean;
}) => posthog?.capture("practice record created", props);

export const trackNoteCreated = (props: { has_reflection: boolean }) =>
  posthog?.capture("note created", props);

export const trackThemeCreated = () => posthog?.capture("theme created");

export const trackPracticeScheduleCreated = (props: {
  event_type: EventType;
  recurring: boolean;
}) => posthog?.capture("practice schedule created", props);

/** 振り返りテンプレに回答したノートの保存完了（`note created` と同時に発火する）。 */
export const trackReviewCompleted = (props: { answer_count: number }) =>
  posthog?.capture("review completed", props);

export const trackShadowSwingCompleted = (props: { swing_count: number }) =>
  posthog?.capture("shadow swing completed", props);

/** Paywall（PaywallModal / Pro 画面）の表示。課金ファネルの分母。 */
export const trackPaywallViewed = (trigger: ProTrigger) =>
  posthog?.capture("paywall viewed", { trigger });

/** Paywall の購入ボタン押下。ストアの購入シートを開く直前に送る。 */
export const trackUpgradeStarted = (props: {
  plan_type: PlanType | null;
  trigger: ProTrigger;
}) => posthog?.capture("upgrade started", props);

/**
 * 購入完了。課金の正は RevenueCat / DB 側であり、このイベントは Paywall 表示からの
 * ファネルを同じ計測基盤で追うためのもの。
 */
export const trackPurchaseCompleted = (props: {
  plan_type: PlanType | null;
  platform: Platform;
  is_trial: boolean;
}) => posthog?.capture("purchase completed", props);

/** 購入失敗。`reason` はユーザーキャンセルとストアエラーを区別できる粒度で渡す。 */
export const trackPurchaseFailed = (props: {
  reason: string;
  plan_type: PlanType | null;
}) => posthog?.capture("purchase failed", props);

/** 無料枠の上限に到達した瞬間。最も課金に近いシグナルとして計測する。 */
export const trackFreeLimitReached = (feature: ProFeature) =>
  posthog?.capture("free limit reached", { feature });

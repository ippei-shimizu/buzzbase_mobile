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

/**
 * 計測イベントに載せるプロパティ。front（`app/utils/posthog.ts`）と揃えて、
 * 個人情報を含みうるオブジェクトの丸ごと送信を型で防ぐためスカラーのみに限定する。
 */
type AnalyticsProperties = Record<string, string | number | boolean | null>;

/**
 * イベントを 1 件送信する。mutation の onSuccess から呼ぶため、計測の失敗で
 * ユーザー操作（保存後の画面遷移など）を壊さないよう例外を握り潰す。
 * TanStack Query は onSuccess が throw すると mutateAsync を reject するため、
 * ここで止めないと「保存できているのに失敗表示」になりうる。
 */
const capture = (event: string, properties?: AnalyticsProperties) => {
  try {
    if (properties) posthog?.capture(event, properties);
    else posthog?.capture(event);
  } catch {
    // 計測は best-effort。
  }
};

export const trackSignUpCompleted = (loginType: LoginType) =>
  capture("sign up completed", { login_type: loginType });

export const trackUserLoggedIn = (loginType: LoginType) =>
  capture("user logged in", { login_type: loginType });

export const trackGameRecordStepViewed = (step: 1 | 2 | 3 | "summary") =>
  capture("game record step viewed", { step });

export const trackGameRecordCompleted = (props: {
  match_type: string | null;
  appearance_type: string;
  has_pitching: boolean;
}) => capture("game record completed", props);

export const trackGroupCreated = (groupId: number) =>
  capture("group created", { group_id: groupId });

export const trackGroupJoined = (groupId: number) =>
  capture("group joined", { group_id: groupId });

export const trackUserFollowed = (followedUserId: number) =>
  capture("user followed", { followed_user_id: followedUserId });

export const trackProfileUpdated = () => capture("profile updated");

/**
 * 打席記録ウィザードの作成 / 更新完了。`is_edit` で新規・編集を区別する。
 * `has_pitcher` / `has_detail` は任意の詳細入力がどれだけ使われたかの計測用。
 */
export const trackPlateAppearanceCompleted = (props: {
  is_edit: boolean;
  has_pitcher: boolean;
  has_detail: boolean;
}) => capture("plate appearance completed", props);

/** 打席記録ウィザードの途中離脱（完了せずに画面を離れた）。 */
export const trackPlateAppearanceCanceled = (props: { is_edit: boolean }) =>
  capture("plate appearance canceled", props);

/** 打撃分析 stats のフィルター変更。どの絞り込みが使われるかの計測用。 */
export const trackStatsFilterChanged = (props: {
  filter_key: string;
  filter_value: string | null;
}) => capture("stats filter changed", props);

/** 打撃成績推移グラフの粒度切替（試合 / 月 / 年 / 直近10）。 */
export const trackBattingTrendGranularityChanged = (
  granularity: BattingTrendGranularity,
) => capture("batting trend granularity changed", { granularity });

/**
 * Pro 訴求（ロックカード / Paywall 導線）のタップ。課金意向シグナルとして計測する。
 * `feature` は `PRO_FEATURES` の正式キーに揃える（略称を混ぜると集計が分裂する）。
 */
export const trackProFeatureTapped = (feature: ProTrigger) =>
  capture("pro feature tapped", { feature });

export const trackGoalCreated = (props: {
  period_type: GoalPeriodType;
  kind: GoalKind;
}) => capture("goal created", props);

/**
 * 練習記録（日次）の保存完了。サーバー側は日付キーの upsert のため、同じ日を
 * 編集し直すと再送される。件数を「作成された記録数」として読めるよう、既存記録の
 * 編集かどうかを `is_edit` で区別する。
 * `menu_count` は量の入力有無に関わらず選択されたメニュー数。
 */
export const trackPracticeRecordCreated = (props: {
  menu_count: number;
  has_condition: boolean;
  is_edit: boolean;
}) => capture("practice record created", props);

/**
 * 野球ノートの作成完了。メディア添付に失敗してノートごとロールバックされた場合も
 * 送信済みのため、件数はごく僅かに上振れする（集計はユニークユーザー数で見る前提）。
 */
export const trackNoteCreated = (props: { has_reflection: boolean }) =>
  capture("note created", props);

export const trackThemeCreated = () => capture("theme created");

export const trackPracticeScheduleCreated = (props: {
  event_type: EventType;
  recurring: boolean;
}) => capture("practice schedule created", props);

/**
 * 振り返りテンプレに回答したノートの保存完了（`note created` と同時に発火する）。
 * 計測するのは新規作成時のみで、保存後の編集でテンプレ回答を足した場合は含まない。
 */
export const trackReviewCompleted = (props: { answer_count: number }) =>
  capture("review completed", props);

export const trackShadowSwingCompleted = (props: { swing_count: number }) =>
  capture("shadow swing completed", props);

/** Paywall（PaywallModal / Pro 画面）の表示。課金ファネルの分母。 */
export const trackPaywallViewed = (trigger: ProTrigger) =>
  capture("paywall viewed", { trigger });

/** Paywall の購入ボタン押下。ストアの購入シートを開く直前に送る。 */
export const trackUpgradeStarted = (props: {
  plan_type: PlanType | null;
  trigger: ProTrigger;
}) => capture("upgrade started", props);

/**
 * 購入完了。課金の正は RevenueCat / DB 側であり、このイベントは Paywall 表示からの
 * ファネルを同じ計測基盤で追うためのもの。
 */
export const trackPurchaseCompleted = (props: {
  plan_type: PlanType | null;
  platform: Platform;
  is_trial: boolean;
}) => capture("purchase completed", props);

/** 購入失敗。`reason` はユーザーキャンセルとストアエラーを区別できる粒度で渡す。 */
export const trackPurchaseFailed = (props: {
  reason: string;
  plan_type: PlanType | null;
}) => capture("purchase failed", props);

/** 無料枠の上限に到達した瞬間。最も課金に近いシグナルとして計測する。 */
export const trackFreeLimitReached = (feature: ProFeature) =>
  capture("free limit reached", { feature });

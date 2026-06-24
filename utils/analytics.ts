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

/** Pro プラン Coming Soon カードのタップ。課金意向シグナルとして計測する。 */
export const trackProFeatureTapped = (feature: string) =>
  posthog?.capture("pro feature tapped", { feature });

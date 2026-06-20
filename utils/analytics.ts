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

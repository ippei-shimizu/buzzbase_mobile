// utils/analytics は posthog シングルトンを直接呼ぶため、HTTP 層ではなくこのモジュール
// 境界をモックして capture の引数を検証する（テスト環境では __DEV__ により
// 本来のシングルトンが null になり、送信内容を観測できないため）。
jest.mock("@utils/posthog", () => ({
  posthog: { capture: jest.fn(), screen: jest.fn() },
}));

import type * as AnalyticsNamespace from "@utils/analytics";
import * as analytics from "@utils/analytics";
import { posthog } from "@utils/posthog";

type AnalyticsModule = typeof AnalyticsNamespace;

const captureMock = posthog?.capture as jest.Mock;

/**
 * front（buzzbase_front/app/utils/analytics.ts）と共通のイベント名・プロパティ。
 * Web / アプリでファネルを横断集計するため、この表からずれてはならない。
 */
const SHARED_EVENT_CASES: {
  event: string;
  properties: Record<string, unknown> | undefined;
  run: (analytics: AnalyticsModule) => void;
}[] = [
  {
    event: "sign up completed",
    properties: { login_type: "google" },
    run: (a) => a.trackSignUpCompleted("google"),
  },
  {
    event: "user logged in",
    properties: { login_type: "email" },
    run: (a) => a.trackUserLoggedIn("email"),
  },
  {
    event: "game record step viewed",
    properties: { step: 2 },
    run: (a) => a.trackGameRecordStepViewed(2),
  },
  {
    event: "game record completed",
    properties: {
      match_type: "regular",
      appearance_type: "starter",
      has_pitching: true,
    },
    run: (a) =>
      a.trackGameRecordCompleted({
        match_type: "regular",
        appearance_type: "starter",
        has_pitching: true,
      }),
  },
  {
    event: "plate appearance completed",
    properties: { is_edit: false, has_pitcher: true, has_detail: false },
    run: (a) =>
      a.trackPlateAppearanceCompleted({
        is_edit: false,
        has_pitcher: true,
        has_detail: false,
      }),
  },
  {
    event: "plate appearance canceled",
    properties: { is_edit: true },
    run: (a) => a.trackPlateAppearanceCanceled({ is_edit: true }),
  },
  {
    event: "group created",
    properties: { group_id: 12 },
    run: (a) => a.trackGroupCreated(12),
  },
  {
    event: "group joined",
    properties: { group_id: 34 },
    run: (a) => a.trackGroupJoined(34),
  },
  {
    event: "user followed",
    properties: { followed_user_id: 56 },
    run: (a) => a.trackUserFollowed(56),
  },
  {
    event: "profile updated",
    properties: undefined,
    run: (a) => a.trackProfileUpdated(),
  },
  {
    event: "stats filter changed",
    properties: { filter_key: "year", filter_value: "2026" },
    run: (a) =>
      a.trackStatsFilterChanged({ filter_key: "year", filter_value: "2026" }),
  },
  {
    event: "batting trend granularity changed",
    properties: { granularity: "month" },
    run: (a) => a.trackBattingTrendGranularityChanged("month"),
  },
  {
    event: "pro feature tapped",
    properties: { feature: "hit_direction_average" },
    run: (a) => a.trackProFeatureTapped("hit_direction_average"),
  },
  {
    event: "goal created",
    properties: { period_type: "monthly", kind: "numeric" },
    run: (a) => a.trackGoalCreated({ period_type: "monthly", kind: "numeric" }),
  },
  {
    event: "practice record created",
    properties: { menu_count: 3, has_condition: true, is_edit: false },
    run: (a) =>
      a.trackPracticeRecordCreated({
        menu_count: 3,
        has_condition: true,
        is_edit: false,
      }),
  },
  {
    event: "note created",
    properties: { has_reflection: true },
    run: (a) => a.trackNoteCreated({ has_reflection: true }),
  },
  {
    event: "theme created",
    properties: undefined,
    run: (a) => a.trackThemeCreated(),
  },
  {
    event: "practice schedule created",
    properties: { event_type: "self_practice", recurring: false },
    run: (a) =>
      a.trackPracticeScheduleCreated({
        event_type: "self_practice",
        recurring: false,
      }),
  },
  {
    event: "review completed",
    properties: { answer_count: 2 },
    run: (a) => a.trackReviewCompleted({ answer_count: 2 }),
  },
  {
    event: "shadow swing completed",
    properties: { swing_count: 120 },
    run: (a) => a.trackShadowSwingCompleted({ swing_count: 120 }),
  },
  {
    event: "paywall viewed",
    properties: { trigger: "unlimited_monthly_goals" },
    run: (a) => a.trackPaywallViewed("unlimited_monthly_goals"),
  },
  {
    event: "upgrade started",
    properties: { plan_type: "yearly", trigger: "general" },
    run: (a) =>
      a.trackUpgradeStarted({ plan_type: "yearly", trigger: "general" }),
  },
  {
    event: "purchase completed",
    properties: { plan_type: "monthly", platform: "ios", is_trial: true },
    run: (a) =>
      a.trackPurchaseCompleted({
        plan_type: "monthly",
        platform: "ios",
        is_trial: true,
      }),
  },
  {
    event: "purchase failed",
    properties: { reason: "user_cancelled", plan_type: "yearly" },
    run: (a) =>
      a.trackPurchaseFailed({ reason: "user_cancelled", plan_type: "yearly" }),
  },
  {
    event: "free limit reached",
    properties: { feature: "unlimited_practice_menus" },
    run: (a) => a.trackFreeLimitReached("unlimited_practice_menus"),
  },
];

describe("analytics", () => {
  beforeEach(() => {
    captureMock.mockClear();
  });

  it.each(SHARED_EVENT_CASES)(
    "$event を front と同じプロパティで送る",
    ({ event, properties, run }) => {
      run(analytics);

      expect(captureMock).toHaveBeenCalledTimes(1);
      // プロパティ無しのイベントは capture(event) と1引数で呼ぶため、
      // toHaveBeenCalledWith(event, undefined) では一致しない。
      const [capturedEvent, capturedProperties] = captureMock.mock.calls[0];
      expect(capturedEvent).toBe(event);
      expect(capturedProperties).toEqual(properties);
    },
  );

  it("イベントプロパティに個人情報を含めない", () => {
    for (const testCase of SHARED_EVENT_CASES) {
      testCase.run(analytics);
    }

    const serialized = JSON.stringify(captureMock.mock.calls);
    expect(serialized).not.toMatch(/@/);
    expect(serialized).not.toMatch(/password/i);
  });
});

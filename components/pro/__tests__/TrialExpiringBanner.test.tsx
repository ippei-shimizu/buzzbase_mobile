import type { ProSubscription } from "../../../types/pro";
import { fireEvent, render } from "@testing-library/react-native";
import { TrialExpiringBanner } from "../TrialExpiringBanner";

jest.mock("expo-router", () => {
  const {
    buildExpoRouterMock,
    // eslint-disable-next-line @typescript-eslint/no-require-imports
  } = require("../../../__tests__/test-utils/mockExpoRouter");
  return buildExpoRouterMock();
});

interface RouterSpies {
  push: jest.Mock;
  replace: jest.Mock;
  back: jest.Mock;
  dismissAll: jest.Mock;
}

const getRouterSpies = (): RouterSpies => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const m = require("expo-router") as { __routerSpies: RouterSpies };
  return m.__routerSpies;
};

const baseSubscription: ProSubscription = {
  status: "trial",
  plan_type: "monthly",
  platform: "ios",
  started_at: null,
  expires_at: null,
  pro_active: true,
  in_trial: true,
  in_grace_period: false,
  days_remaining: null,
  is_early_subscriber: false,
  has_used_trial: false,
};

describe("TrialExpiringBanner", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("in_trial かつ残り 3 日以内ならバナーを表示する", () => {
    const { getByText } = render(
      <TrialExpiringBanner
        subscription={{ ...baseSubscription, days_remaining: 2 }}
      />,
    );

    expect(getByText("トライアルはあと 2 日で終了します")).toBeTruthy();
  });

  it("in_trial だが残り 4 日以上なら描画しない", () => {
    const { queryByText } = render(
      <TrialExpiringBanner
        subscription={{ ...baseSubscription, days_remaining: 5 }}
      />,
    );

    expect(queryByText(/トライアルはあと/)).toBeNull();
  });

  it("in_trial=false なら描画しない（残り日数を満たしていても）", () => {
    const { queryByText } = render(
      <TrialExpiringBanner
        subscription={{
          ...baseSubscription,
          in_trial: false,
          days_remaining: 1,
        }}
      />,
    );

    expect(queryByText(/トライアルはあと/)).toBeNull();
  });

  it("days_remaining が null なら描画しない", () => {
    const { queryByText } = render(
      <TrialExpiringBanner
        subscription={{ ...baseSubscription, days_remaining: null }}
      />,
    );

    expect(queryByText(/トライアルはあと/)).toBeNull();
  });

  it("タップで /account/subscription に push する", () => {
    const { getByText } = render(
      <TrialExpiringBanner
        subscription={{ ...baseSubscription, days_remaining: 1 }}
      />,
    );

    fireEvent.press(getByText("トライアルはあと 1 日で終了します"));

    expect(getRouterSpies().push).toHaveBeenCalledWith("/account/subscription");
  });
});

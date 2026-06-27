import type { ProSubscription } from "../../../types/pro";
import { fireEvent, render } from "@testing-library/react-native";
import { BillingIssueAlert } from "../BillingIssueAlert";

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
};

describe("BillingIssueAlert", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("status=billing_issue でバナーが表示される", () => {
    const { getByText } = render(
      <BillingIssueAlert
        subscription={{ ...baseSubscription, status: "billing_issue" }}
      />,
    );

    expect(getByText("決済情報の更新が必要です")).toBeTruthy();
  });

  it("status が他のときは何も描画しない", () => {
    const { queryByText } = render(
      <BillingIssueAlert
        subscription={{
          ...baseSubscription,
          status: "active",
          pro_active: true,
        }}
      />,
    );

    expect(queryByText("決済情報の更新が必要です")).toBeNull();
  });

  it("タップで /account/subscription に push する", () => {
    const { getByText } = render(
      <BillingIssueAlert
        subscription={{ ...baseSubscription, status: "billing_issue" }}
      />,
    );

    fireEvent.press(getByText("決済情報の更新が必要です"));

    expect(getRouterSpies().push).toHaveBeenCalledWith("/account/subscription");
  });
});

import type { ProSubscription } from "../../../types/pro";
import { fireEvent, render } from "@testing-library/react-native";
import { SubscriptionStatusCard } from "../SubscriptionStatusCard";

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

describe("SubscriptionStatusCard", () => {
  it("status=free は「無料プラン」と表示し、解約案内ボタンを出さない", () => {
    const onPress = jest.fn();
    const { getByText, queryByLabelText } = render(
      <SubscriptionStatusCard
        subscription={baseSubscription}
        onPressCancelGuide={onPress}
      />,
    );

    expect(getByText("無料プラン")).toBeTruthy();
    expect(queryByLabelText("解約方法を見る")).toBeNull();
  });

  it("status=trial は「無料トライアル中」と表示し、解約案内ボタンを出す", () => {
    const onPress = jest.fn();
    const { getByText, getByLabelText } = render(
      <SubscriptionStatusCard
        subscription={{
          ...baseSubscription,
          status: "trial",
          plan_type: "monthly",
          pro_active: true,
          in_trial: true,
          expires_at: "2026-06-30T00:00:00+09:00",
          days_remaining: 5,
        }}
        onPressCancelGuide={onPress}
      />,
    );

    expect(getByText("無料トライアル中")).toBeTruthy();
    expect(getByText("月額プラン")).toBeTruthy();

    fireEvent.press(getByLabelText("解約方法を見る"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("status=active は「Pro 加入中」と表示し、解約案内ボタンを出す", () => {
    const onPress = jest.fn();
    const { getByText, getByLabelText } = render(
      <SubscriptionStatusCard
        subscription={{
          ...baseSubscription,
          status: "active",
          plan_type: "yearly",
          pro_active: true,
          expires_at: "2027-04-01T00:00:00+09:00",
        }}
        onPressCancelGuide={onPress}
      />,
    );

    expect(getByText("Pro 加入中")).toBeTruthy();
    expect(getByText("年額プラン")).toBeTruthy();
    expect(getByLabelText("解約方法を見る")).toBeTruthy();
  });

  it("status=cancelled は「解約済み（期間内）」と表示し、解約案内ボタンは出さない", () => {
    const { getByText, queryByLabelText } = render(
      <SubscriptionStatusCard
        subscription={{
          ...baseSubscription,
          status: "cancelled",
          plan_type: "monthly",
          pro_active: true,
          in_grace_period: true,
        }}
        onPressCancelGuide={jest.fn()}
      />,
    );

    expect(getByText("解約済み（期間内）")).toBeTruthy();
    expect(queryByLabelText("解約方法を見る")).toBeNull();
  });

  it("status=billing_issue は警告メッセージを表示する", () => {
    const { getByText } = render(
      <SubscriptionStatusCard
        subscription={{
          ...baseSubscription,
          status: "billing_issue",
          plan_type: "monthly",
        }}
      />,
    );

    expect(getByText("決済に問題があります")).toBeTruthy();
  });

  it("status=expired は再加入を案内する", () => {
    const { getByText } = render(
      <SubscriptionStatusCard
        subscription={{ ...baseSubscription, status: "expired" }}
      />,
    );

    expect(getByText("Pro 期間終了")).toBeTruthy();
  });

  describe("メタラベルの出し分け", () => {
    it("active のときは「次回更新日」と表示する", () => {
      const { getByText } = render(
        <SubscriptionStatusCard
          subscription={{
            ...baseSubscription,
            status: "active",
            pro_active: true,
            plan_type: "monthly",
            expires_at: "2026-06-30T00:00:00+09:00",
          }}
        />,
      );

      expect(getByText("次回更新日")).toBeTruthy();
    });

    it("expired のときは「利用期限」と表示する", () => {
      const { getByText } = render(
        <SubscriptionStatusCard
          subscription={{
            ...baseSubscription,
            status: "expired",
            expires_at: "2026-04-01T00:00:00+09:00",
          }}
        />,
      );

      expect(getByText("利用期限")).toBeTruthy();
    });

    it("cancelled のときは「利用期限」と表示する", () => {
      const { getByText } = render(
        <SubscriptionStatusCard
          subscription={{
            ...baseSubscription,
            status: "cancelled",
            plan_type: "monthly",
            pro_active: true,
            expires_at: "2026-07-01T00:00:00+09:00",
          }}
        />,
      );

      expect(getByText("利用期限")).toBeTruthy();
    });
  });

  it("onPressCancelGuide 未指定なら trial / active でも解約案内ボタンは出さない", () => {
    const { queryByLabelText } = render(
      <SubscriptionStatusCard
        subscription={{
          ...baseSubscription,
          status: "active",
          pro_active: true,
        }}
      />,
    );

    expect(queryByLabelText("解約方法を見る")).toBeNull();
  });
});

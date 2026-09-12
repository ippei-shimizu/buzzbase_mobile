import { fireEvent } from "@testing-library/react-native";
import { useProStatus } from "@hooks/useProStatus";
import { renderWithProviders } from "../../../../__tests__/test-utils/renderWithProviders";
import { DEFAULT_PRO_STATUS, type ProStatus } from "../../../../types/pro";
import SubscriptionScreen from "../index";

jest.mock("expo-router", () => {
  const {
    buildExpoRouterMock,
    // eslint-disable-next-line @typescript-eslint/no-require-imports
  } = require("../../../../__tests__/test-utils/mockExpoRouter");
  return buildExpoRouterMock();
});

jest.mock("@hooks/useProStatus", () => ({
  useProStatus: jest.fn(),
}));

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

const useProStatusMock = useProStatus as jest.Mock;

const stubProStatus = (
  overrides: Partial<ProStatus> = {},
  hookOverrides: { isError?: boolean; refetch?: jest.Mock } = {},
) => {
  useProStatusMock.mockReturnValue({
    proStatus: { ...DEFAULT_PRO_STATUS, ...overrides },
    isPro: false,
    isLoading: false,
    isError: false,
    error: null,
    refetch: jest.fn(),
    isRefreshing: false,
    ...hookOverrides,
  });
};

describe("SubscriptionScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("状態取得エラー時は「未加入」と誤表示せず、エラーと再試行ボタンを出す", () => {
    const refetch = jest.fn();
    stubProStatus({}, { isError: true, refetch });

    const { getByText, getByLabelText, queryByLabelText } = renderWithProviders(
      <SubscriptionScreen />,
    );

    expect(getByText("状態の取得に失敗しました")).toBeTruthy();
    expect(queryByLabelText("Pro に加入する")).toBeNull();

    fireEvent.press(getByLabelText("再試行"));
    expect(refetch).toHaveBeenCalled();
  });

  it("free 状態のとき「Pro に加入する」ボタンを表示、タップで /pro に push", () => {
    stubProStatus();

    const { getByLabelText } = renderWithProviders(<SubscriptionScreen />);
    fireEvent.press(getByLabelText("Pro に加入する"));

    expect(getRouterSpies().push).toHaveBeenCalledWith("/pro");
  });

  it("active 状態のとき「Pro に加入する」CTA は出さず、解約方法を見るボタンが出る", () => {
    stubProStatus({
      subscription: {
        ...DEFAULT_PRO_STATUS.subscription,
        status: "active",
        pro_active: true,
        plan_type: "yearly",
      },
    });

    const { queryByLabelText, getByLabelText } = renderWithProviders(
      <SubscriptionScreen />,
    );

    expect(queryByLabelText("Pro に加入する")).toBeNull();
    expect(getByLabelText("解約方法を見る")).toBeTruthy();
  });

  it("解約方法を見る → CancelGuideModal が開く（iOS 加入者は Apple の案内）", () => {
    stubProStatus({
      subscription: {
        ...DEFAULT_PRO_STATUS.subscription,
        status: "active",
        pro_active: true,
        plan_type: "monthly",
        platform: "ios",
      },
    });

    const { getByLabelText, getByText } = renderWithProviders(
      <SubscriptionScreen />,
    );

    fireEvent.press(getByLabelText("解約方法を見る"));

    expect(getByText("Pro プランの解約方法")).toBeTruthy();
    expect(getByLabelText("Apple サブスクリプション設定を開く")).toBeTruthy();
  });

  it("解約方法を見る → Android 加入者には Google Play の案内を出す（Apple の案内を誤表示しない）", () => {
    stubProStatus({
      subscription: {
        ...DEFAULT_PRO_STATUS.subscription,
        status: "active",
        pro_active: true,
        plan_type: "monthly",
        platform: "android",
      },
    });

    const { getByLabelText, queryByLabelText } = renderWithProviders(
      <SubscriptionScreen />,
    );

    fireEvent.press(getByLabelText("解約方法を見る"));

    expect(getByLabelText("Google Play の定期購入を開く")).toBeTruthy();
    expect(queryByLabelText("Apple サブスクリプション設定を開く")).toBeNull();
  });
});

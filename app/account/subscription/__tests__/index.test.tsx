import { fireEvent } from "@testing-library/react-native";
import { useFeatureFlag } from "@hooks/useFeatureFlag";
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

jest.mock("@hooks/useFeatureFlag", () => ({
  useFeatureFlag: jest.fn(),
}));

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

const useFeatureFlagMock = useFeatureFlag as jest.Mock;
const useProStatusMock = useProStatus as jest.Mock;

const stubProStatus = (overrides: Partial<ProStatus> = {}) => {
  useProStatusMock.mockReturnValue({
    proStatus: { ...DEFAULT_PRO_STATUS, ...overrides },
    isPro: false,
    isLoading: false,
    isError: false,
    error: null,
    refetch: jest.fn(),
    isRefreshing: false,
  });
};

describe("SubscriptionScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("pro_features=false なら / にリダイレクト（状態取得しない）", () => {
    useFeatureFlagMock.mockReturnValue(false);
    stubProStatus();

    renderWithProviders(<SubscriptionScreen />);

    // Redirect 自体は描画されるが、router.push は呼ばれない
    expect(getRouterSpies().push).not.toHaveBeenCalled();
  });

  it("free 状態のとき「Pro に加入する」ボタンを表示、タップで /pro に push", () => {
    useFeatureFlagMock.mockReturnValue(true);
    stubProStatus();

    const { getByLabelText } = renderWithProviders(<SubscriptionScreen />);
    fireEvent.press(getByLabelText("Pro に加入する"));

    expect(getRouterSpies().push).toHaveBeenCalledWith("/pro");
  });

  it("active 状態のとき「Pro に加入する」CTA は出さず、解約方法を見るボタンが出る", () => {
    useFeatureFlagMock.mockReturnValue(true);
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

  it("解約方法を見る → CancelGuideModal が開く", () => {
    useFeatureFlagMock.mockReturnValue(true);
    stubProStatus({
      subscription: {
        ...DEFAULT_PRO_STATUS.subscription,
        status: "active",
        pro_active: true,
        plan_type: "monthly",
      },
    });

    const { getByLabelText, getByText } = renderWithProviders(
      <SubscriptionScreen />,
    );

    fireEvent.press(getByLabelText("解約方法を見る"));

    expect(getByText("Pro プランの解約方法")).toBeTruthy();
  });
});

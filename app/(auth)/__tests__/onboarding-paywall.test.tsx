/**
 * 登録直後 Paywall の振る舞いテスト。
 *
 * 課金処理そのものは app/pro 側のテストで担保しているため、ここでは
 * 「この配置に固有の振る舞い」（抜ける先・出さない条件・placement 付きの計測）だけを見る。
 */
import { fireEvent, waitFor } from "@testing-library/react-native";
import { getOfferings } from "@services/revenueCatService";
import { useSnackbarStore } from "@stores/snackbarStore";
import {
  apiUrl,
  http,
  HttpResponse,
} from "../../../__tests__/test-utils/handlers";
import { renderWithProviders } from "../../../__tests__/test-utils/renderWithProviders";
import { server } from "../../../jest-setup-msw";
import { DEFAULT_PRO_STATUS } from "../../../types/pro";
import { posthog } from "../../../utils/posthog";
import OnboardingPaywallScreen from "../onboarding-paywall";

jest.mock("expo-router", () => {
  const {
    buildExpoRouterMock,
    // eslint-disable-next-line @typescript-eslint/no-require-imports
  } = require("../../../__tests__/test-utils/mockExpoRouter");
  return buildExpoRouterMock({
    searchParams: { leadSlide: "pitch_type" },
  });
});

// react-native-purchases はネイティブ Module 境界。services は jest.mock しないルールの例外。
jest.mock("@services/revenueCatService", () => ({
  getOfferings: jest.fn(),
  purchasePackage: jest.fn(),
  restorePurchases: jest.fn(),
}));

jest.mock("@stores/snackbarStore", () => ({
  useSnackbarStore: jest.fn(),
}));

jest.mock("../../../utils/posthog", () => ({
  posthog: { capture: jest.fn(), screen: jest.fn(), identify: jest.fn() },
}));

interface RouterSpies {
  push: jest.Mock;
  replace: jest.Mock;
  back: jest.Mock;
  dismissAll: jest.Mock;
}

const getRouterSpies = (): RouterSpies => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const expoRouterMock = require("expo-router") as {
    __routerSpies: RouterSpies;
  };
  return expoRouterMock.__routerSpies;
};

const getOfferingsMock = getOfferings as jest.Mock;
const useSnackbarStoreMock = useSnackbarStore as unknown as jest.Mock;
const captureMock = posthog?.capture as jest.Mock;

const mockOffering = {
  identifier: "default",
  availablePackages: [
    {
      identifier: "monthly",
      packageType: "MONTHLY",
      product: {
        title: "月額プラン",
        description: "毎月課金されるプラン",
        priceString: "￥480",
        price: 480,
        currencyCode: "JPY",
      },
    },
  ],
};

const setupSnackbar = () => {
  const showMock = jest.fn();
  useSnackbarStoreMock.mockImplementation((selector: (s: unknown) => unknown) =>
    selector({ show: showMock }),
  );
  return showMock;
};

const givenProStatus = (overrides: Record<string, unknown> = {}) => {
  server.use(
    http.get(apiUrl("/pro/status"), () =>
      HttpResponse.json({
        ...DEFAULT_PRO_STATUS,
        subscription: { ...DEFAULT_PRO_STATUS.subscription, ...overrides },
      }),
    ),
  );
};

const capturedEvent = (event: string) =>
  captureMock.mock.calls.find(([name]) => name === event);

describe("OnboardingPaywallScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupSnackbar();
  });

  it("閉じるとダッシュボードへ抜け、離脱を placement 付きで計測する", async () => {
    givenProStatus();
    getOfferingsMock.mockResolvedValue(mockOffering);

    const screen = renderWithProviders(<OnboardingPaywallScreen />);
    fireEvent.press(await screen.findByLabelText("閉じる"));

    await waitFor(() => {
      expect(getRouterSpies().replace).toHaveBeenCalledWith("/(tabs)");
    });
    expect(capturedEvent("paywall dismissed")?.[1]).toEqual(
      expect.objectContaining({ placement: "onboarding" }),
    );
  });

  it("表示を placement と先頭スライド付きで計測し、trigger は機能キーで汚さない", async () => {
    givenProStatus();
    getOfferingsMock.mockResolvedValue(mockOffering);

    renderWithProviders(<OnboardingPaywallScreen />);

    await waitFor(() => {
      expect(capturedEvent("paywall viewed")?.[1]).toEqual({
        trigger: "general",
        placement: "onboarding",
        lead_slide: "pitch_type",
      });
    });
  });

  it("加入済みユーザーには出さずダッシュボードへ抜ける", async () => {
    givenProStatus({ pro_active: true, status: "active" });
    getOfferingsMock.mockResolvedValue(mockOffering);

    const screen = renderWithProviders(<OnboardingPaywallScreen />);

    await waitFor(() => {
      expect(getRouterSpies().replace).toHaveBeenCalledWith("/(tabs)");
    });
    expect(capturedEvent("paywall viewed")).toBeUndefined();
    expect(screen.queryByLabelText("閉じる")).toBeNull();
  });

  it("購入できるプランが無いときは出さずダッシュボードへ抜ける", async () => {
    givenProStatus();
    getOfferingsMock.mockResolvedValue({
      identifier: "default",
      availablePackages: [],
    });

    const screen = renderWithProviders(<OnboardingPaywallScreen />);

    await waitFor(() => {
      expect(getRouterSpies().replace).toHaveBeenCalledWith("/(tabs)");
    });
    // 取得失敗・0件で抜けた分をファネルの分母に入れない
    expect(capturedEvent("paywall viewed")).toBeUndefined();
    expect(capturedEvent("paywall step viewed")).toBeUndefined();
    expect(screen.queryByLabelText("閉じる")).toBeNull();
  });

  it("閉じるを連打しても離脱の計測は1回だけ送る", async () => {
    givenProStatus();
    getOfferingsMock.mockResolvedValue(mockOffering);

    const screen = renderWithProviders(<OnboardingPaywallScreen />);
    const closeButton = await screen.findByLabelText("閉じる");
    fireEvent.press(closeButton);
    fireEvent.press(closeButton);

    await waitFor(() => {
      expect(getRouterSpies().replace).toHaveBeenCalledTimes(1);
    });
    const dismissed = captureMock.mock.calls.filter(
      ([name]) => name === "paywall dismissed",
    );
    expect(dismissed).toHaveLength(1);
  });
});

import { fireEvent, waitFor } from "@testing-library/react-native";
import { useFeatureFlag } from "@hooks/useFeatureFlag";
import {
  getOfferings,
  purchasePackage,
  restorePurchases,
} from "@services/revenueCatService";
import { useSnackbarStore } from "@stores/snackbarStore";
import {
  apiUrl,
  http,
  HttpResponse,
} from "../../../__tests__/test-utils/handlers";
import { renderWithProviders } from "../../../__tests__/test-utils/renderWithProviders";
import { server } from "../../../jest-setup-msw";
import { DEFAULT_PRO_STATUS } from "../../../types/pro";
import ProScreen from "../index";

jest.mock("expo-router", () => {
  const {
    buildExpoRouterMock,
    // eslint-disable-next-line @typescript-eslint/no-require-imports
  } = require("../../../__tests__/test-utils/mockExpoRouter");
  return buildExpoRouterMock();
});

// react-native-purchases はネイティブ Module 境界。services は jest.mock しないルールの例外。
jest.mock("@services/revenueCatService", () => ({
  getOfferings: jest.fn(),
  purchasePackage: jest.fn(),
  restorePurchases: jest.fn(),
}));

jest.mock("@hooks/useFeatureFlag", () => ({
  useFeatureFlag: jest.fn(),
}));

jest.mock("@stores/snackbarStore", () => ({
  useSnackbarStore: jest.fn(),
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
const useSnackbarStoreMock = useSnackbarStore as unknown as jest.Mock;
const getOfferingsMock = getOfferings as jest.Mock;
const purchasePackageMock = purchasePackage as jest.Mock;
const restorePurchasesMock = restorePurchases as jest.Mock;

const mockOffering = {
  identifier: "default",
  availablePackages: [
    {
      identifier: "monthly",
      packageType: "MONTHLY",
      product: {
        title: "月額プラン",
        description: "毎月課金されるプラン",
        priceString: "¥980",
        price: 980,
      },
    },
    {
      identifier: "annual",
      packageType: "ANNUAL",
      product: {
        title: "年額プラン",
        description: "年1回課金されるプラン",
        priceString: "¥9,800",
        price: 9800,
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

// /pro/sync を MSW で intercept する。respond で受信回数を観測する。
const setupSyncEndpoint = () => {
  let calledCount = 0;
  server.use(
    http.post(apiUrl("/pro/sync"), () => {
      calledCount += 1;
      return HttpResponse.json(DEFAULT_PRO_STATUS);
    }),
  );
  return {
    get callCount() {
      return calledCount;
    },
  };
};

describe("ProScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("pro_features=false なら / にリダイレクト（API も叩かない）", async () => {
    useFeatureFlagMock.mockReturnValue({ enabled: false, isLoading: false });
    setupSnackbar();

    renderWithProviders(<ProScreen />);

    await waitFor(() => {
      expect(getOfferingsMock).not.toHaveBeenCalled();
    });
  });

  it("pro_features=true で PaywallModal と同じ構成（ブランド表示・機能比較表・プラン一覧）を表示する", async () => {
    useFeatureFlagMock.mockReturnValue({ enabled: true, isLoading: false });
    setupSnackbar();
    getOfferingsMock.mockResolvedValueOnce(mockOffering);

    const { findByText, getByText } = renderWithProviders(<ProScreen />);

    expect(getByText("BUZZ BASE")).toBeOnTheScreen();
    expect(getByText("PRO でできること")).toBeOnTheScreen();
    expect(getByText("注意事項")).toBeOnTheScreen();
    expect(await findByText("月額プラン")).toBeTruthy();
    expect(await findByText("¥980/月")).toBeTruthy();
  });

  it("年額プランに月額換算比のお得金額バッジが表示される", async () => {
    useFeatureFlagMock.mockReturnValue({ enabled: true, isLoading: false });
    setupSnackbar();
    getOfferingsMock.mockResolvedValueOnce(mockOffering);

    const { findByText } = renderWithProviders(<ProScreen />);

    // 月額980円×12=11,760円 に対し年額9,800円 → 1,960円お得。
    expect(await findByText("年間¥1,960お得")).toBeTruthy();
  });

  it("プランを選択して PROを始めるを押すと購入し、成功後 success 画面へ遷移する", async () => {
    useFeatureFlagMock.mockReturnValue({ enabled: true, isLoading: false });
    setupSnackbar();
    const syncTracker = setupSyncEndpoint();
    getOfferingsMock.mockResolvedValueOnce(mockOffering);
    purchasePackageMock.mockResolvedValueOnce(undefined);

    const { findByLabelText } = renderWithProviders(<ProScreen />);

    // 年額プランがあるので初期選択は年額プランになる。
    await waitFor(() => expect(getOfferingsMock).toHaveBeenCalledTimes(1));
    const ctaButton = await findByLabelText("PROを始める");
    fireEvent.press(ctaButton);

    await waitFor(() => {
      expect(purchasePackageMock).toHaveBeenCalledWith(
        expect.objectContaining({ identifier: "annual" }),
      );
    });
    await waitFor(() => {
      expect(syncTracker.callCount).toBe(1);
    });
    await waitFor(() => {
      expect(getRouterSpies().replace).toHaveBeenCalledWith("/pro/success");
    });
  });

  it("月額プランを選び直して PROを始めるを押すと選択中のプランで購入する", async () => {
    useFeatureFlagMock.mockReturnValue({ enabled: true, isLoading: false });
    setupSnackbar();
    setupSyncEndpoint();
    getOfferingsMock.mockResolvedValueOnce(mockOffering);
    purchasePackageMock.mockResolvedValueOnce(undefined);

    const { findByLabelText } = renderWithProviders(<ProScreen />);

    const monthlyCard = await findByLabelText("月額プラン ¥980");
    fireEvent.press(monthlyCard);
    fireEvent.press(await findByLabelText("PROを始める"));

    await waitFor(() => {
      expect(purchasePackageMock).toHaveBeenCalledWith(
        expect.objectContaining({ identifier: "monthly" }),
      );
    });
  });

  it("ユーザーキャンセル（userCancelled=true）では snackbar も画面遷移もしない", async () => {
    useFeatureFlagMock.mockReturnValue({ enabled: true, isLoading: false });
    const showMock = setupSnackbar();
    const syncTracker = setupSyncEndpoint();
    getOfferingsMock.mockResolvedValueOnce(mockOffering);
    purchasePackageMock.mockRejectedValueOnce(
      Object.assign(new Error("cancelled"), { userCancelled: true }),
    );

    const { findByLabelText } = renderWithProviders(<ProScreen />);
    const ctaButton = await findByLabelText("PROを始める");
    fireEvent.press(ctaButton);

    await waitFor(() => {
      expect(purchasePackageMock).toHaveBeenCalledTimes(1);
    });
    expect(showMock).not.toHaveBeenCalled();
    expect(syncTracker.callCount).toBe(0);
    expect(getRouterSpies().replace).not.toHaveBeenCalled();
  });

  it("getOfferings が失敗しても画面は表示され、プラン欄が空状態になる", async () => {
    useFeatureFlagMock.mockReturnValue({ enabled: true, isLoading: false });
    setupSnackbar();
    getOfferingsMock.mockRejectedValueOnce(new Error("offerings unavailable"));

    const { findByText } = renderWithProviders(<ProScreen />);

    expect(
      await findByText(
        "プラン情報を取得できませんでした。時間を置いて再度お試しください。",
      ),
    ).toBeTruthy();
  });

  it("購入エラー（userCancelled でない）では snackbar を出す", async () => {
    useFeatureFlagMock.mockReturnValue({ enabled: true, isLoading: false });
    const showMock = setupSnackbar();
    getOfferingsMock.mockResolvedValueOnce(mockOffering);
    purchasePackageMock.mockRejectedValueOnce(new Error("network down"));

    const { findByLabelText } = renderWithProviders(<ProScreen />);
    const ctaButton = await findByLabelText("PROを始める");
    fireEvent.press(ctaButton);

    await waitFor(() => {
      expect(showMock).toHaveBeenCalledWith(
        expect.objectContaining({ type: "error" }),
      );
    });
    expect(getRouterSpies().replace).not.toHaveBeenCalled();
  });

  it("購入を復元を押すと restorePurchases が呼ばれ、成功時は前の画面に戻る", async () => {
    setupSyncEndpoint();
    useFeatureFlagMock.mockReturnValue({ enabled: true, isLoading: false });
    getOfferingsMock.mockResolvedValueOnce(mockOffering);
    restorePurchasesMock.mockResolvedValueOnce(undefined);
    const showMock = setupSnackbar();

    const { findByLabelText } = renderWithProviders(<ProScreen />);
    const restoreLink = await findByLabelText("購入を復元");
    fireEvent.press(restoreLink);

    await waitFor(() => {
      expect(restorePurchasesMock).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(getRouterSpies().back).toHaveBeenCalled();
    });
    expect(showMock).toHaveBeenCalledWith(
      expect.objectContaining({ type: "success" }),
    );
  });
});

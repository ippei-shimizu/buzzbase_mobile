import { fireEvent, waitFor } from "@testing-library/react-native";
import { useFeatureFlag } from "@hooks/useFeatureFlag";
import { getOfferings, purchasePackage } from "@services/revenueCatService";
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

const mockOffering = {
  identifier: "default",
  availablePackages: [
    {
      identifier: "monthly",
      product: {
        title: "月額プラン",
        description: "毎月課金されるプラン",
        priceString: "¥980",
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

  it("pro_features=true で getOfferings を呼び、availablePackages を表示する", async () => {
    useFeatureFlagMock.mockReturnValue({ enabled: true, isLoading: false });
    setupSnackbar();
    getOfferingsMock.mockResolvedValueOnce(mockOffering);

    const { findByText } = renderWithProviders(<ProScreen />);

    expect(await findByText("月額プラン")).toBeTruthy();
    expect(await findByText("¥980")).toBeTruthy();
  });

  it("購入成功で syncProStatus + invalidateQueries + /pro/success へ replace", async () => {
    useFeatureFlagMock.mockReturnValue({ enabled: true, isLoading: false });
    setupSnackbar();
    const syncTracker = setupSyncEndpoint();
    getOfferingsMock.mockResolvedValueOnce(mockOffering);
    purchasePackageMock.mockResolvedValueOnce(undefined);

    const { findByLabelText } = renderWithProviders(<ProScreen />);
    const button = await findByLabelText("月額プラン で加入");

    fireEvent.press(button);

    await waitFor(() => {
      expect(purchasePackageMock).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(syncTracker.callCount).toBe(1);
    });
    await waitFor(() => {
      expect(getRouterSpies().replace).toHaveBeenCalledWith("/pro/success");
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
    const button = await findByLabelText("月額プラン で加入");

    fireEvent.press(button);

    await waitFor(() => {
      expect(purchasePackageMock).toHaveBeenCalledTimes(1);
    });
    expect(showMock).not.toHaveBeenCalled();
    expect(syncTracker.callCount).toBe(0);
    expect(getRouterSpies().replace).not.toHaveBeenCalled();
  });

  it("購入エラー（userCancelled でない）では snackbar を出す", async () => {
    useFeatureFlagMock.mockReturnValue({ enabled: true, isLoading: false });
    const showMock = setupSnackbar();
    getOfferingsMock.mockResolvedValueOnce(mockOffering);
    purchasePackageMock.mockRejectedValueOnce(new Error("network down"));

    const { findByLabelText } = renderWithProviders(<ProScreen />);
    const button = await findByLabelText("月額プラン で加入");

    fireEvent.press(button);

    await waitFor(() => {
      expect(showMock).toHaveBeenCalledWith(
        expect.objectContaining({ type: "error" }),
      );
    });
    expect(getRouterSpies().replace).not.toHaveBeenCalled();
  });
});

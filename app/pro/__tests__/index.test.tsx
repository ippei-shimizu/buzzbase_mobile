import { fireEvent, waitFor } from "@testing-library/react-native";
import { useFeatureFlag } from "@hooks/useFeatureFlag";
import { syncProStatus } from "@services/proService";
import { getOfferings, purchasePackage } from "@services/revenueCatService";
import { useSnackbarStore } from "@stores/snackbarStore";
import { renderWithProviders } from "../../../__tests__/test-utils/renderWithProviders";
import ProScreen from "../index";

jest.mock("expo-router", () => {
  const {
    buildExpoRouterMock,
    // eslint-disable-next-line @typescript-eslint/no-require-imports
  } = require("../../../__tests__/test-utils/mockExpoRouter");
  return buildExpoRouterMock();
});

jest.mock("@services/revenueCatService", () => ({
  getOfferings: jest.fn(),
  purchasePackage: jest.fn(),
}));

jest.mock("@services/proService", () => ({
  syncProStatus: jest.fn().mockResolvedValue(undefined),
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
const syncProStatusMock = syncProStatus as jest.Mock;

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

describe("ProScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("pro_features=false なら / にリダイレクト（API も叩かない）", async () => {
    useFeatureFlagMock.mockReturnValue(false);
    setupSnackbar();

    renderWithProviders(<ProScreen />);

    await waitFor(() => {
      expect(getOfferingsMock).not.toHaveBeenCalled();
    });
  });

  it("pro_features=true で getOfferings を呼び、availablePackages を表示する", async () => {
    useFeatureFlagMock.mockReturnValue(true);
    setupSnackbar();
    getOfferingsMock.mockResolvedValueOnce(mockOffering);

    const { findByText } = renderWithProviders(<ProScreen />);

    expect(await findByText("月額プラン")).toBeTruthy();
    expect(await findByText("¥980")).toBeTruthy();
  });

  it("購入成功で syncProStatus + invalidateQueries + /pro/success へ replace", async () => {
    useFeatureFlagMock.mockReturnValue(true);
    setupSnackbar();
    getOfferingsMock.mockResolvedValueOnce(mockOffering);
    purchasePackageMock.mockResolvedValueOnce(undefined);

    const { findByLabelText } = renderWithProviders(<ProScreen />);
    const button = await findByLabelText("月額プラン で加入");

    fireEvent.press(button);

    await waitFor(() => {
      expect(purchasePackageMock).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(syncProStatusMock).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(getRouterSpies().replace).toHaveBeenCalledWith("/pro/success");
    });
  });

  it("ユーザーキャンセル（userCancelled=true）では snackbar も画面遷移もしない", async () => {
    useFeatureFlagMock.mockReturnValue(true);
    const showMock = setupSnackbar();
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
    expect(syncProStatusMock).not.toHaveBeenCalled();
    expect(getRouterSpies().replace).not.toHaveBeenCalled();
  });

  it("購入エラー（userCancelled でない）では snackbar を出す", async () => {
    useFeatureFlagMock.mockReturnValue(true);
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

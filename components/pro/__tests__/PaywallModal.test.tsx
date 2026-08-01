/**
 * PaywallModal（下からせり出すシート型ペイウォール）の結合テスト。
 *
 * 方針:
 * - feature ごとのハイライトコピー表示、閉じる、feature_flag gate を確認する。
 * - getOfferings/purchasePackage/restorePurchases はネイティブ Module 境界のため
 *   services を jest.mock する（app/pro/index.test.tsx と同じ例外パターン）。
 * - 購入成功時の syncProStatus は /pro/sync への実リクエストを MSW で観測する。
 */
import { fireEvent, waitFor } from "@testing-library/react-native";
import { PURCHASES_ERROR_CODE } from "react-native-purchases";
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
import { DEFAULT_PRO_STATUS, PRO_FEATURES } from "../../../types/pro";
import {
  FEATURE_GROUPS,
  filterFeatureGroups,
  PaywallModal,
} from "../PaywallModal";

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

const mockOnClose = jest.fn();

describe("PaywallModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useFeatureFlagMock.mockReturnValue({ enabled: true, isLoading: false });
    setupSnackbar();
  });

  it("Pro 機能を渡すと、その機能に対応したハイライトコピーが表示される", () => {
    getOfferingsMock.mockResolvedValueOnce(null);

    const { getByText } = renderWithProviders(
      <PaywallModal
        isOpen
        onClose={mockOnClose}
        feature="season_transition_graph"
      />,
    );

    expect(getByText("シーズンを跨いだ成長を可視化")).toBeOnTheScreen();
  });

  it("contextMessageを渡すと、なぜ表示されているかの状況説明が汎用コピーと併せて表示される", () => {
    getOfferingsMock.mockResolvedValueOnce(null);

    const { getByText } = renderWithProviders(
      <PaywallModal
        isOpen
        onClose={mockOnClose}
        feature="unlimited_media_uploads"
        contextMessage="今月の無料上限（3件）に達したため、1件の画像・動画は保存できませんでした。"
      />,
    );

    expect(
      getByText(
        "今月の無料上限（3件）に達したため、1件の画像・動画は保存できませんでした。",
      ),
    ).toBeOnTheScreen();
    expect(getByText("動画・画像を無制限にアップロード")).toBeOnTheScreen();
  });

  it("contextMessageを渡さない場合は状況説明バナーを表示しない", () => {
    getOfferingsMock.mockResolvedValueOnce(null);

    const { queryByText } = renderWithProviders(
      <PaywallModal
        isOpen
        onClose={mockOnClose}
        feature="unlimited_media_uploads"
      />,
    );

    expect(queryByText(/今月の無料上限/)).not.toBeOnTheScreen();
  });

  it("isOpen が false のときは表示されない", () => {
    const { queryByText } = renderWithProviders(
      <PaywallModal
        isOpen={false}
        onClose={mockOnClose}
        feature="season_transition_graph"
      />,
    );

    expect(queryByText("シーズンを跨いだ成長を可視化")).not.toBeOnTheScreen();
  });

  it("pro_features=false のときは isOpen でも何も描画しない（kill switch）", () => {
    useFeatureFlagMock.mockReturnValue({ enabled: false, isLoading: false });

    const { queryByText } = renderWithProviders(
      <PaywallModal
        isOpen
        onClose={mockOnClose}
        feature="season_transition_graph"
      />,
    );

    expect(queryByText("シーズンを跨いだ成長を可視化")).not.toBeOnTheScreen();
  });

  it("閉じるボタンで onClose が呼ばれる", () => {
    getOfferingsMock.mockResolvedValueOnce(null);

    const { getByLabelText } = renderWithProviders(
      <PaywallModal isOpen onClose={mockOnClose} feature="no_ads" />,
    );

    fireEvent.press(getByLabelText("閉じる"));

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("開くと getOfferings を呼び、取得したプランを一覧表示する", async () => {
    getOfferingsMock.mockResolvedValueOnce(mockOffering);

    const { findByText } = renderWithProviders(
      <PaywallModal isOpen onClose={mockOnClose} feature="no_ads" />,
    );

    expect(await findByText("月額プラン")).toBeTruthy();
    expect(await findByText("年額プラン")).toBeTruthy();
  });

  it("年額プランに月額換算比のお得金額バッジが表示される", async () => {
    getOfferingsMock.mockResolvedValueOnce(mockOffering);

    const { findByText } = renderWithProviders(
      <PaywallModal isOpen onClose={mockOnClose} feature="no_ads" />,
    );

    // 月額980円×12=11,760円 に対し年額9,800円 → 1,960円お得。
    expect(await findByText("年間¥1,960お得")).toBeTruthy();
  });

  it("getOfferings が失敗してもシートは表示され、プラン欄が空状態になる", async () => {
    getOfferingsMock.mockRejectedValueOnce(new Error("offerings unavailable"));

    const { findByText } = renderWithProviders(
      <PaywallModal isOpen onClose={mockOnClose} feature="no_ads" />,
    );

    expect(
      await findByText(
        "プラン情報を取得できませんでした。時間を置いて再度お試しください。",
      ),
    ).toBeTruthy();
  });

  it("PROを始めるボタンで選択中プランを購入し、成功後 success 画面へ遷移する", async () => {
    const syncTracker = setupSyncEndpoint();
    getOfferingsMock.mockResolvedValueOnce(mockOffering);
    purchasePackageMock.mockResolvedValueOnce(undefined);

    const { findByLabelText } = renderWithProviders(
      <PaywallModal isOpen onClose={mockOnClose} feature="no_ads" />,
    );

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
      expect(mockOnClose).toHaveBeenCalled();
      expect(getRouterSpies().push).toHaveBeenCalledWith("/pro/success");
    });
  });

  it("ユーザーキャンセル（userCancelled=true）では snackbar も画面遷移もしない", async () => {
    const syncTracker = setupSyncEndpoint();
    getOfferingsMock.mockResolvedValueOnce(mockOffering);
    purchasePackageMock.mockRejectedValueOnce(
      Object.assign(new Error("cancelled"), { userCancelled: true }),
    );
    const snackbarSpy = setupSnackbar();

    const { findByLabelText } = renderWithProviders(
      <PaywallModal isOpen onClose={mockOnClose} feature="no_ads" />,
    );
    const ctaButton = await findByLabelText("PROを始める");
    fireEvent.press(ctaButton);

    await waitFor(() => {
      expect(purchasePackageMock).toHaveBeenCalledTimes(1);
    });
    expect(snackbarSpy).not.toHaveBeenCalled();
    expect(syncTracker.callCount).toBe(0);
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it("購入エラー（userCancelled でない）では snackbar を出す", async () => {
    const showMock = setupSnackbar();
    getOfferingsMock.mockResolvedValueOnce(mockOffering);
    purchasePackageMock.mockRejectedValueOnce(new Error("network down"));

    const { findByLabelText } = renderWithProviders(
      <PaywallModal isOpen onClose={mockOnClose} feature="no_ads" />,
    );
    const ctaButton = await findByLabelText("PROを始める");
    fireEvent.press(ctaButton);

    await waitFor(() => {
      expect(showMock).toHaveBeenCalledWith(
        expect.objectContaining({ type: "error" }),
      );
    });
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it("課金成功後に /pro/sync が失敗しても「購入失敗」にせず success 画面へ遷移する", async () => {
    getOfferingsMock.mockResolvedValueOnce(mockOffering);
    purchasePackageMock.mockResolvedValueOnce(undefined);
    const showMock = setupSnackbar();
    server.use(
      http.post(apiUrl("/pro/sync"), () =>
        HttpResponse.json({ error: "revenuecat_api_error" }, { status: 502 }),
      ),
    );

    const { findByLabelText } = renderWithProviders(
      <PaywallModal isOpen onClose={mockOnClose} feature="no_ads" />,
    );
    const ctaButton = await findByLabelText("PROを始める");
    fireEvent.press(ctaButton);

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
      expect(getRouterSpies().push).toHaveBeenCalledWith("/pro/success");
    });
    expect(showMock).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: "error" }),
    );
  });

  it("PAYMENT_PENDING_ERROR ではエラーではなく保留中の案内を出す", async () => {
    const showMock = setupSnackbar();
    getOfferingsMock.mockResolvedValueOnce(mockOffering);
    purchasePackageMock.mockRejectedValueOnce(
      Object.assign(new Error("payment pending"), {
        code: PURCHASES_ERROR_CODE.PAYMENT_PENDING_ERROR,
      }),
    );

    const { findByLabelText } = renderWithProviders(
      <PaywallModal isOpen onClose={mockOnClose} feature="no_ads" />,
    );
    fireEvent.press(await findByLabelText("PROを始める"));

    await waitFor(() => {
      expect(showMock).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "info",
          message: expect.stringContaining("保留中"),
        }),
      );
    });
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it("PRODUCT_ALREADY_PURCHASED_ERROR では購入の復元を案内する", async () => {
    const showMock = setupSnackbar();
    getOfferingsMock.mockResolvedValueOnce(mockOffering);
    purchasePackageMock.mockRejectedValueOnce(
      Object.assign(new Error("already purchased"), {
        code: PURCHASES_ERROR_CODE.PRODUCT_ALREADY_PURCHASED_ERROR,
      }),
    );

    const { findByLabelText } = renderWithProviders(
      <PaywallModal isOpen onClose={mockOnClose} feature="no_ads" />,
    );
    fireEvent.press(await findByLabelText("PROを始める"));

    await waitFor(() => {
      expect(showMock).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "info",
          message: expect.stringContaining("購入を復元"),
        }),
      );
    });
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it("購入を復元を押すと restorePurchases が呼ばれ、復元対象があれば onClose される", async () => {
    setupSyncEndpoint();
    getOfferingsMock.mockResolvedValueOnce(mockOffering);
    restorePurchasesMock.mockResolvedValueOnce({
      entitlements: { active: { buzzbase_pro: {} } },
    });
    const showMock = setupSnackbar();

    const { findByLabelText } = renderWithProviders(
      <PaywallModal isOpen onClose={mockOnClose} feature="no_ads" />,
    );
    const restoreLink = await findByLabelText("購入を復元");
    fireEvent.press(restoreLink);

    await waitFor(() => {
      expect(restorePurchasesMock).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
    expect(showMock).toHaveBeenCalledWith(
      expect.objectContaining({ type: "success" }),
    );
  });

  it("復元対象が 0 件のときは成功表示せず「復元できる購入情報がない」案内を出す", async () => {
    setupSyncEndpoint();
    getOfferingsMock.mockResolvedValueOnce(mockOffering);
    restorePurchasesMock.mockResolvedValueOnce({
      entitlements: { active: {} },
    });
    const showMock = setupSnackbar();

    const { findByLabelText } = renderWithProviders(
      <PaywallModal isOpen onClose={mockOnClose} feature="no_ads" />,
    );
    fireEvent.press(await findByLabelText("購入を復元"));

    await waitFor(() => {
      expect(showMock).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "info",
          message: "復元できる購入情報がありませんでした",
        }),
      );
    });
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it("ハイライトカードで表示中の機能は「PRO でできること」表に重複表示されない", () => {
    getOfferingsMock.mockResolvedValueOnce(null);

    const { getAllByText } = renderWithProviders(
      <PaywallModal isOpen onClose={mockOnClose} feature="note_tags" />,
    );

    expect(getAllByText("野球ノートにタグを付けて整理")).toHaveLength(1);
  });

  it("グループ見出しと無料/PROの比較値が表示される", () => {
    getOfferingsMock.mockResolvedValueOnce(null);

    const { getByText, getByLabelText } = renderWithProviders(
      <PaywallModal isOpen onClose={mockOnClose} feature="no_ads" />,
    );

    expect(getByText("野球ノート")).toBeOnTheScreen();
    expect(
      getByLabelText("1つのノートに複数の試合を紐付け。無料は1件、PROは複数件"),
    ).toBeOnTheScreen();
  });
});

describe("FEATURE_GROUPS", () => {
  it("PRO_FEATURES の全項目を過不足・重複なく分類している", () => {
    const allGroupedKeys = FEATURE_GROUPS.flatMap((group) => group.keys);

    expect(allGroupedKeys).toHaveLength(PRO_FEATURES.length);
    expect(new Set(allGroupedKeys).size).toBe(PRO_FEATURES.length);
    expect(new Set(allGroupedKeys)).toEqual(new Set(PRO_FEATURES));
  });
});

describe("filterFeatureGroups", () => {
  it("指定した feature をグループ内から除外する", () => {
    const result = filterFeatureGroups(
      [
        {
          title: "野球ノート",
          icon: "book-outline",
          keys: ["note_tags", "multi_game_result_notes"],
        },
      ],
      "note_tags",
    );

    expect(result[0].keys).toEqual(["multi_game_result_notes"]);
  });

  it("除外後に0件になったグループは結果から取り除かれる", () => {
    const result = filterFeatureGroups(
      [{ title: "野球ノート", icon: "book-outline", keys: ["note_tags"] }],
      "note_tags",
    );

    expect(result).toEqual([]);
  });
});

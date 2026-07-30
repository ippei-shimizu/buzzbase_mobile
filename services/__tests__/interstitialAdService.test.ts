/**
 * 試合記録保存後インタースティシャル広告の振る舞いテスト。
 * 猶予期間・1日1回上限・Pro加入者の非表示判定を検証する。
 *
 * react-native-google-mobile-adsはこのファイル専用にローカルモックする。
 * jest.mock(...)のファクトリはモジュールのrequire解決時に呼ばれるため、
 * ファクトリ外側で宣言したconstを参照すると初期化前に読まれることがある
 * (jest.mockはjest.fn/importより先にホイストされるが、周囲のconst宣言は
 * ホイストされない)。そのため、モックの状態は全てファクトリ内で完結させ、
 * テスト側からは`InterstitialAd.createForAdRequest`のmock.resultsを
 * 経由して生成済みインスタンスを取得する。
 */
import * as SecureStore from "expo-secure-store";
import { InterstitialAd } from "react-native-google-mobile-ads";
import {
  showMatchSaveInterstitial,
  trackAppLaunchForAds,
} from "../interstitialAdService";

interface MockInterstitialInstance {
  addAdEventListener: jest.Mock;
  load: jest.Mock;
  show: jest.Mock;
  fireEvent: (type: "loaded" | "closed" | "error") => void;
}

jest.mock("react-native-google-mobile-ads", () => ({
  AdEventType: { LOADED: "loaded", CLOSED: "closed", ERROR: "error" },
  TestIds: {
    BANNER: "test-banner-unit-id",
    INTERSTITIAL: "test-interstitial-unit-id",
  },
  InterstitialAd: {
    createForAdRequest: jest.fn(() => {
      const listeners: Record<string, (() => void)[]> = {};
      return {
        addAdEventListener: jest.fn((type: string, callback: () => void) => {
          listeners[type] = [...(listeners[type] ?? []), callback];
          return () => {
            listeners[type] = (listeners[type] ?? []).filter(
              (registered) => registered !== callback,
            );
          };
        }),
        load: jest.fn(),
        show: jest.fn().mockResolvedValue(undefined),
        fireEvent: (type: string) => {
          (listeners[type] ?? []).forEach((callback) => callback());
        },
      };
    }),
  },
}));

const mockCreateForAdRequest = InterstitialAd.createForAdRequest as jest.Mock;

const latestInstance = (): MockInterstitialInstance =>
  mockCreateForAdRequest.mock.results[
    mockCreateForAdRequest.mock.results.length - 1
  ].value as MockInterstitialInstance;

// SecureStoreの複数回await解決を待つため、マイクロタスク数に依存せず
// 実タイマー(setTimeout 0)でポーリングする。
const waitUntil = async (
  condition: () => boolean,
  timeoutMs = 1000,
): Promise<void> => {
  const start = Date.now();
  while (!condition()) {
    if (Date.now() - start > timeoutMs) {
      throw new Error("waitUntil: condition not met within timeout");
    }
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
};

const getSecureStore = () =>
  SecureStore as unknown as {
    getItemAsync: jest.Mock;
    setItemAsync: jest.Mock;
  };

const daysAgoIso = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

describe("showMatchSaveInterstitial", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Pro加入者(no_ads entitlement)には表示しない", async () => {
    await showMatchSaveInterstitial(true);

    expect(mockCreateForAdRequest).not.toHaveBeenCalled();
  });

  it("初回起動後の猶予期間中(起動回数不足)は表示しない", async () => {
    getSecureStore().getItemAsync.mockImplementation((key: string) => {
      if (key === "admob_install_date") return Promise.resolve(daysAgoIso(30));
      if (key === "admob_launch_count") return Promise.resolve("2");
      return Promise.resolve(null);
    });

    await showMatchSaveInterstitial(false);

    expect(mockCreateForAdRequest).not.toHaveBeenCalled();
  });

  it("初回起動後の猶予期間中(日数不足)は表示しない", async () => {
    getSecureStore().getItemAsync.mockImplementation((key: string) => {
      if (key === "admob_install_date") return Promise.resolve(daysAgoIso(1));
      if (key === "admob_launch_count") return Promise.resolve("10");
      return Promise.resolve(null);
    });

    await showMatchSaveInterstitial(false);

    expect(mockCreateForAdRequest).not.toHaveBeenCalled();
  });

  it("1日の表示上限に達していたら表示しない", async () => {
    const today = new Date().toISOString().slice(0, 10);
    getSecureStore().getItemAsync.mockImplementation((key: string) => {
      if (key === "admob_install_date") return Promise.resolve(daysAgoIso(30));
      if (key === "admob_launch_count") return Promise.resolve("10");
      if (key === "admob_interstitial_last_shown_date")
        return Promise.resolve(today);
      if (key === "admob_interstitial_shown_count_today")
        return Promise.resolve("1");
      return Promise.resolve(null);
    });

    await showMatchSaveInterstitial(false);

    expect(mockCreateForAdRequest).not.toHaveBeenCalled();
  });

  it("猶予期間を過ぎ上限未達なら広告を読み込んで表示し、表示回数を記録する", async () => {
    getSecureStore().getItemAsync.mockImplementation((key: string) => {
      if (key === "admob_install_date") return Promise.resolve(daysAgoIso(30));
      if (key === "admob_launch_count") return Promise.resolve("10");
      return Promise.resolve(null);
    });

    const resultPromise = showMatchSaveInterstitial(false);
    await waitUntil(() => mockCreateForAdRequest.mock.results.length > 0);
    const instance = latestInstance();
    await waitUntil(() => instance.load.mock.calls.length > 0);
    instance.fireEvent("loaded");
    await waitUntil(() => instance.show.mock.calls.length > 0);
    instance.fireEvent("closed");
    await resultPromise;

    expect(instance.load).toHaveBeenCalled();
    expect(instance.show).toHaveBeenCalled();
    expect(getSecureStore().setItemAsync).toHaveBeenCalledWith(
      "admob_interstitial_shown_count_today",
      "1",
    );
  });
});

describe("trackAppLaunchForAds", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("インストール日が未記録なら記録し、起動回数をインクリメントする", async () => {
    getSecureStore().getItemAsync.mockResolvedValue(null);

    await trackAppLaunchForAds();

    expect(getSecureStore().setItemAsync).toHaveBeenCalledWith(
      "admob_install_date",
      expect.any(String),
    );
    expect(getSecureStore().setItemAsync).toHaveBeenCalledWith(
      "admob_launch_count",
      "1",
    );
  });

  it("インストール日が記録済みなら上書きせず、起動回数だけ増やす", async () => {
    getSecureStore().getItemAsync.mockImplementation((key: string) => {
      if (key === "admob_install_date")
        return Promise.resolve("2026-01-01T00:00:00.000Z");
      if (key === "admob_launch_count") return Promise.resolve("3");
      return Promise.resolve(null);
    });

    await trackAppLaunchForAds();

    expect(getSecureStore().setItemAsync).not.toHaveBeenCalledWith(
      "admob_install_date",
      expect.anything(),
    );
    expect(getSecureStore().setItemAsync).toHaveBeenCalledWith(
      "admob_launch_count",
      "4",
    );
  });
});

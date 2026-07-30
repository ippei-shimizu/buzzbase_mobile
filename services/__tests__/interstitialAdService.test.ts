/**
 * 試合記録保存後インタースティシャル広告の振る舞いテスト。
 * 猶予期間・1日1回上限・Pro加入者の非表示判定を検証する。
 * react-native-google-mobile-adsはこのファイル専用にローカルモックし、
 * イベント発火を手動でシミュレートする。
 */
import * as SecureStore from "expo-secure-store";
import {
  showMatchSaveInterstitial,
  trackAppLaunchForAds,
} from "../interstitialAdService";

const mockListeners: Record<string, (() => void)[]> = {};
const mockLoad = jest.fn();
const mockShow = jest.fn();
const mockCreateForAdRequest = jest.fn(() => ({
  addAdEventListener: (type: string, callback: () => void) => {
    mockListeners[type] = [...(mockListeners[type] ?? []), callback];
    return () => {
      mockListeners[type] = (mockListeners[type] ?? []).filter(
        (registered) => registered !== callback,
      );
    };
  },
  load: mockLoad,
  show: mockShow,
}));

jest.mock("react-native-google-mobile-ads", () => ({
  AdEventType: { LOADED: "loaded", CLOSED: "closed", ERROR: "error" },
  InterstitialAd: { createForAdRequest: mockCreateForAdRequest },
  TestIds: {
    BANNER: "test-banner-unit-id",
    INTERSTITIAL: "test-interstitial-unit-id",
  },
}));

const fireAdEvent = (type: "loaded" | "closed" | "error") => {
  (mockListeners[type] ?? []).forEach((callback) => callback());
};

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
    for (const key of Object.keys(mockListeners)) delete mockListeners[key];
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
    await waitUntil(() => mockLoad.mock.calls.length > 0);
    fireAdEvent("loaded");
    await waitUntil(() => mockShow.mock.calls.length > 0);
    fireAdEvent("closed");
    await resultPromise;

    expect(mockLoad).toHaveBeenCalled();
    expect(mockShow).toHaveBeenCalled();
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

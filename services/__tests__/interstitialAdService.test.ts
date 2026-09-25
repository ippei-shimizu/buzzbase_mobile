/**
 * 試合記録保存後インタースティシャル広告の振る舞いテスト。
 * 猶予期間・1日2回上限・最短表示間隔・編集保存・Pro加入者の非表示判定を検証する。
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

// 実装と同じく端末ローカルの暦日。UTC日付だとJSTの00:00〜09:00に実行したとき
// 実装の返す日付と食い違い、表示履歴が「今日」と判定されなくなる。
const todayString = (): string => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
};

const minutesAgoIso = (minutes: number): string =>
  new Date(Date.now() - minutes * 60 * 1000).toISOString();

// 猶予期間を抜けたユーザーの SecureStore 応答。overrides で表示履歴を足す。
const mockStoredValues = (overrides: Record<string, string> = {}): void => {
  const values: Record<string, string> = {
    admob_install_date: daysAgoIso(30),
    admob_launch_count: "10",
    ...overrides,
  };
  getSecureStore().getItemAsync.mockImplementation((key: string) =>
    Promise.resolve(values[key] ?? null),
  );
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

  it("編集保存では表示しない", async () => {
    mockStoredValues();

    await showMatchSaveInterstitial(false, true);

    expect(mockCreateForAdRequest).not.toHaveBeenCalled();
  });

  it("1日の表示上限に達していたら表示しない", async () => {
    mockStoredValues({
      admob_interstitial_last_shown_date: todayString(),
      admob_interstitial_shown_count_today: "2",
      admob_interstitial_last_shown_at: minutesAgoIso(60),
    });

    await showMatchSaveInterstitial(false);

    expect(mockCreateForAdRequest).not.toHaveBeenCalled();
  });

  it("前回の表示から間もないうちは上限未達でも表示しない", async () => {
    mockStoredValues({
      admob_interstitial_last_shown_date: todayString(),
      admob_interstitial_shown_count_today: "1",
      admob_interstitial_last_shown_at: minutesAgoIso(5),
    });

    await showMatchSaveInterstitial(false);

    expect(mockCreateForAdRequest).not.toHaveBeenCalled();
  });

  it("前回の表示から充分に時間が空いていれば2回目も表示する", async () => {
    mockStoredValues({
      admob_interstitial_last_shown_date: todayString(),
      admob_interstitial_shown_count_today: "1",
      admob_interstitial_last_shown_at: minutesAgoIso(30),
    });

    const resultPromise = showMatchSaveInterstitial(false);
    await waitUntil(() => mockCreateForAdRequest.mock.results.length > 0);
    const instance = latestInstance();
    await waitUntil(() => instance.load.mock.calls.length > 0);
    instance.fireEvent("loaded");
    await waitUntil(() => instance.show.mock.calls.length > 0);
    instance.fireEvent("closed");
    await resultPromise;

    expect(instance.show).toHaveBeenCalled();
    expect(getSecureStore().setItemAsync).toHaveBeenCalledWith(
      "admob_interstitial_shown_count_today",
      "2",
    );
  });

  it("猶予期間を過ぎ上限未達なら広告を読み込んで表示し、表示回数を記録する", async () => {
    mockStoredValues();

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
    expect(getSecureStore().setItemAsync).toHaveBeenCalledWith(
      "admob_interstitial_last_shown_at",
      expect.any(String),
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

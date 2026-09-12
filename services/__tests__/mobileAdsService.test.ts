/**
 * Google Mobile Ads SDK 初期化サービスの振る舞いテスト。
 * 初期化が走らないと広告が一切返らないため、起動時に1回だけ実行されること、
 * 失敗してもアプリを落とさずSentryへ送ることを担保する。
 */
import * as Sentry from "@sentry/react-native";
import mobileAds from "react-native-google-mobile-ads";

const initializeMock = () =>
  (mobileAds() as unknown as { initialize: jest.Mock }).initialize;

const loadService = async () => {
  // モジュール内で初期化済みPromiseを保持するため、テストごとに読み直す。
  jest.resetModules();
  return import("../mobileAdsService");
};

describe("initializeMobileAds", () => {
  beforeEach(() => {
    initializeMock().mockClear();
    initializeMock().mockResolvedValue([]);
    (Sentry.captureException as jest.Mock).mockClear();
  });

  it("SDKの初期化を実行する", async () => {
    const { initializeMobileAds } = await loadService();

    await initializeMobileAds();

    expect(initializeMock()).toHaveBeenCalledTimes(1);
  });

  it("複数回呼ばれても初期化は1回だけ実行する", async () => {
    const { initializeMobileAds } = await loadService();

    await Promise.all([initializeMobileAds(), initializeMobileAds()]);
    await initializeMobileAds();

    expect(initializeMock()).toHaveBeenCalledTimes(1);
  });

  it("初期化が失敗しても例外を投げずSentryへ送る", async () => {
    initializeMock().mockRejectedValueOnce(new Error("init failed"));
    const { initializeMobileAds } = await loadService();

    await expect(initializeMobileAds()).resolves.toBeUndefined();

    expect(Sentry.captureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        tags: { source: "mobile_ads_initialize" },
      }),
    );
  });
});

/**
 * Google Mobile Ads SDK 初期化サービスの振る舞いテスト。
 * 初期化が走らないと広告が一切返らないため、起動時に1回だけ実行されること、
 * 失敗してもアプリを落とさずSentryへ送ることを担保する。
 */

/**
 * サービスは初期化済みPromiseをモジュール内に保持するため、テストごとに読み直す。
 * resetModulesでモックも作り直されるので、サービスと同じタイミングで取得した
 * インスタンスを返す。
 */
const loadService = () => {
  jest.resetModules();
  const service = require("../mobileAdsService");
  const mobileAds = require("react-native-google-mobile-ads").default;
  const Sentry = require("@sentry/react-native");
  return {
    initializeMobileAds: service.initializeMobileAds as () => Promise<void>,
    getMobileAdsInitialized: service.getMobileAdsInitialized as () => boolean,
    subscribeMobileAdsInitialized: service.subscribeMobileAdsInitialized as (
      listener: () => void,
    ) => () => void,
    initialize: mobileAds().initialize as jest.Mock,
    captureException: Sentry.captureException as jest.Mock,
  };
};

describe("initializeMobileAds", () => {
  it("SDKの初期化を実行する", async () => {
    const { initializeMobileAds, initialize } = loadService();

    await initializeMobileAds();

    expect(initialize).toHaveBeenCalledTimes(1);
  });

  it("複数回呼ばれても初期化は1回だけ実行する", async () => {
    const { initializeMobileAds, initialize } = loadService();

    await Promise.all([initializeMobileAds(), initializeMobileAds()]);
    await initializeMobileAds();

    expect(initialize).toHaveBeenCalledTimes(1);
  });

  it("初期化完了まで未完了を返し、完了後に購読者へ通知する", async () => {
    const {
      initializeMobileAds,
      getMobileAdsInitialized,
      subscribeMobileAdsInitialized,
    } = loadService();
    const listener = jest.fn();
    subscribeMobileAdsInitialized(listener);

    expect(getMobileAdsInitialized()).toBe(false);

    await initializeMobileAds();

    expect(getMobileAdsInitialized()).toBe(true);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("初期化が失敗しても描画を止めないよう完了扱いにする", async () => {
    const { initializeMobileAds, getMobileAdsInitialized, initialize } =
      loadService();
    initialize.mockRejectedValueOnce(new Error("init failed"));

    await initializeMobileAds();

    expect(getMobileAdsInitialized()).toBe(true);
  });

  it("初期化が失敗しても例外を投げずSentryへ送る", async () => {
    const { initializeMobileAds, initialize, captureException } = loadService();
    initialize.mockRejectedValueOnce(new Error("init failed"));

    await expect(initializeMobileAds()).resolves.toBeUndefined();

    expect(captureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ tags: { source: "mobile_ads_initialize" } }),
    );
  });
});

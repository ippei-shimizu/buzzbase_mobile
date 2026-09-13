/**
 * 広告ユニットIDの解決と、未設定をSentryへ警告する振る舞いのテスト。
 * この検知が壊れると「広告枠が黙って消える」状態に誰も気付けなくなるため、
 * 未設定・空文字の両方を検知できることを担保する。
 */

const TOUCHED_ENV_KEYS = [
  "EXPO_PUBLIC_ADMOB_BANNER_UNIT_ID_BOTTOM_NAV_IOS",
  "EXPO_PUBLIC_ADMOB_BANNER_UNIT_ID_BOTTOM_NAV_ANDROID",
  "EXPO_PUBLIC_ADMOB_BANNER_UNIT_ID_HOME_ANDROID",
  "EXPO_PUBLIC_ADMOB_INTERSTITIAL_UNIT_ID_ANDROID",
] as const;

interface LoadOptions {
  env?: Partial<Record<(typeof TOUCHED_ENV_KEYS)[number], string | undefined>>;
  platformOS?: "ios" | "android";
}

/**
 * constants/admob は import 時に環境変数を読み、未設定の報告もモジュール内の Set で
 * dedupe するため、ケースごとに読み直す。resetModules はモックも作り直すので、
 * Platform / Sentry も同じタイミングで取得したインスタンスを使う。
 */
const loadAdmob = ({ env = {}, platformOS }: LoadOptions = {}) => {
  jest.resetModules();
  Object.entries(env).forEach(([key, value]) => {
    if (value === undefined) {
      delete process.env[key];
      return;
    }
    process.env[key] = value;
  });

  const { Platform } = require("react-native");
  const replacedPlatform = platformOS
    ? jest.replaceProperty(Platform, "OS", platformOS)
    : null;

  const admob = require("../admob") as typeof import("../admob");
  const { captureMessage } = require("@sentry/react-native") as {
    captureMessage: jest.Mock;
  };

  return {
    admob,
    captureMessage,
    restore: () => replacedPlatform?.restore(),
  };
};

describe("広告ユニットIDの解決", () => {
  const originalDev = __DEV__;
  const originalEnv = new Map(
    TOUCHED_ENV_KEYS.map((key) => [key, process.env[key]]),
  );

  beforeEach(() => {
    // テスト環境の __DEV__ は true で、そのままだとテスト用ユニットIDが返って
    // 本番の分岐を通らないため false に倒す。
    (globalThis as unknown as { __DEV__: boolean }).__DEV__ = false;
  });

  afterEach(() => {
    (globalThis as unknown as { __DEV__: boolean }).__DEV__ = originalDev;
    originalEnv.forEach((value, key) => {
      if (value === undefined) {
        delete process.env[key];
        return;
      }
      process.env[key] = value;
    });
  });

  it("環境変数が設定されていればそのユニットIDを返す", () => {
    const { admob, captureMessage, restore } = loadAdmob({
      env: {
        EXPO_PUBLIC_ADMOB_BANNER_UNIT_ID_BOTTOM_NAV_IOS: "ca-app-pub-test/1234",
      },
    });

    expect(admob.bottomNavBannerAdUnitId()).toBe("ca-app-pub-test/1234");
    expect(captureMessage).not.toHaveBeenCalled();
    restore();
  });

  it("未設定なら枠ごとに1回だけSentryへ警告を送る", () => {
    const { admob, captureMessage, restore } = loadAdmob({
      env: { EXPO_PUBLIC_ADMOB_BANNER_UNIT_ID_BOTTOM_NAV_IOS: undefined },
    });

    expect(admob.bottomNavBannerAdUnitId()).toBeUndefined();
    expect(admob.bottomNavBannerAdUnitId()).toBeUndefined();

    expect(captureMessage).toHaveBeenCalledTimes(1);
    expect(captureMessage).toHaveBeenCalledWith(
      expect.stringContaining("banner_bottom_nav"),
      expect.objectContaining({
        level: "warning",
        tags: expect.objectContaining({
          source: "admob_missing_ad_unit_id",
          adUnitName: "banner_bottom_nav",
        }),
      }),
    );
    restore();
  });

  it("空文字で登録されている場合も未設定として警告を送る", () => {
    const { admob, captureMessage, restore } = loadAdmob({
      env: { EXPO_PUBLIC_ADMOB_BANNER_UNIT_ID_BOTTOM_NAV_IOS: "" },
    });

    expect(admob.bottomNavBannerAdUnitId()).toBeUndefined();
    expect(captureMessage).toHaveBeenCalledTimes(1);
    restore();
  });

  it("広告を運用しないプラットフォームでは警告を送らずundefinedを返す", () => {
    const { admob, captureMessage, restore } = loadAdmob({
      platformOS: "android",
      env: {
        EXPO_PUBLIC_ADMOB_BANNER_UNIT_ID_BOTTOM_NAV_ANDROID: undefined,
        EXPO_PUBLIC_ADMOB_BANNER_UNIT_ID_HOME_ANDROID: undefined,
        EXPO_PUBLIC_ADMOB_INTERSTITIAL_UNIT_ID_ANDROID: undefined,
      },
    });

    expect(admob.isAdsEnabledPlatform()).toBe(false);
    expect(admob.bottomNavBannerAdUnitId()).toBeUndefined();
    expect(admob.interstitialAdUnitId()).toBeUndefined();
    expect(admob.bannerAdUnitIdFor("home")).toBeUndefined();

    expect(captureMessage).not.toHaveBeenCalled();
    restore();
  });
});

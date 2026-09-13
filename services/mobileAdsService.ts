import * as Sentry from "@sentry/react-native";
import mobileAds from "react-native-google-mobile-ads";
import { isAdsEnabledPlatform } from "@constants/admob";

let initialization: Promise<void> | null = null;

/**
 * Google Mobile Ads SDKを初期化する。広告の読み込み前に1回呼ぶ必要があり、
 * iOSではこのJS呼び出し経由でしかネイティブのSDK起動処理が走らないため、
 * 呼ばないとユニットIDが正しくても広告が一切返らない。
 * 起動ごとに1回で足りるので、結果のPromiseを使い回して二重初期化を避ける。
 */
export const initializeMobileAds = (): Promise<void> => {
  // 広告を配信しないプラットフォームではSDKを起動しない。
  if (!isAdsEnabledPlatform()) return Promise.resolve();

  initialization ??= mobileAds()
    .initialize()
    .then(() => undefined)
    .catch((error: unknown) => {
      // 初期化失敗は広告が出ないだけでアプリは動くため、握って続行する。
      // 検知手段がSentryしかないので必ず送る。
      Sentry.captureException(error, {
        tags: { source: "mobile_ads_initialize" },
      });
    });
  return initialization;
};

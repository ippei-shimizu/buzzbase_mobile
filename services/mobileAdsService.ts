import * as Sentry from "@sentry/react-native";
import mobileAds from "react-native-google-mobile-ads";
import { isAdsEnabledPlatform } from "@constants/admob";

let initialization: Promise<void> | null = null;
let isInitialized = false;
const initializedListeners = new Set<() => void>();

const markInitialized = (): void => {
  if (isInitialized) return;
  isInitialized = true;
  initializedListeners.forEach((listener) => listener());
};

/** useSyncExternalStore 用のスナップショット。 */
export const getMobileAdsInitialized = (): boolean => isInitialized;

/** useSyncExternalStore 用の購読。戻り値は解除関数。 */
export const subscribeMobileAdsInitialized = (
  listener: () => void,
): (() => void) => {
  initializedListeners.add(listener);
  return () => {
    initializedListeners.delete(listener);
  };
};

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
    .then(() => {
      markInitialized();
    })
    .catch((error: unknown) => {
      // 初期化失敗は広告が出ないだけでアプリは動くため、握って続行する。
      // 検知手段がSentryしかないので必ず送る。
      Sentry.captureException(error, {
        tags: { source: "mobile_ads_initialize" },
      });
      // 失敗した Promise を保持すると以降の呼び出しが「成功済み」として素通りする。
      // 起動直後のネットワーク不通で広告が永久に出ない状態を避けるため捨てる。
      initialization = null;
      // 起動処理が失敗してもリクエスト自体は通る可能性があるため、描画は止めない。
      markInitialized();
    });
  return initialization;
};

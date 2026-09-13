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

/**
 * 初期化が応答しないまま広告が永久に出ない状態を避けるための上限。
 * この時間を超えたら初期化を待たずにバナーの描画を許可する(このPR以前と同じ挙動)。
 */
const INITIALIZE_TIMEOUT_MS = 5_000;

const withTimeout = (promise: Promise<unknown>): Promise<unknown> =>
  Promise.race([
    promise,
    new Promise((_resolve, reject) =>
      setTimeout(
        () => reject(new Error("mobileAds().initialize() timed out")),
        INITIALIZE_TIMEOUT_MS,
      ),
    ),
  ]);

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

  // 初期化が確定しない限りバナーを描画しないため、完了通知に至らない経路を残さない。
  // ネイティブモジュールの呼び出しが同期的に throw した場合も catch に流す。
  initialization ??= Promise.resolve()
    .then(() => withTimeout(mobileAds().initialize()))
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

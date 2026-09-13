import * as Sentry from "@sentry/react-native";
import { Platform } from "react-native";
import { TestIds } from "react-native-google-mobile-ads";

/**
 * 広告を運用しているプラットフォームかどうか。AndroidはAdMob側のアプリ・広告
 * ユニットが未整備で配信していないため、未設定を設定漏れとして扱わない。
 * Androidで広告を始めるときにこの条件を外す。
 *
 * モジュール評価時ではなく呼び出し時に Platform.OS を読むことで、テストから
 * jest.replaceProperty で差し替えられるようにしている。
 */
export const isAdsEnabledPlatform = (): boolean => Platform.OS === "ios";

export type BannerPlacement =
  | "home"
  | "game_results"
  | "stats"
  | "groups"
  | "profile";

// 画面ごとに広告ユニットを分けて、AdMob側でどの画面が収益を稼いでいるか
// 個別に確認できるようにする。
const BANNER_UNIT_ID_BY_PLACEMENT: Record<
  BannerPlacement,
  { ios?: string; android?: string }
> = {
  home: {
    ios: process.env.EXPO_PUBLIC_ADMOB_BANNER_UNIT_ID_HOME_IOS,
    android: process.env.EXPO_PUBLIC_ADMOB_BANNER_UNIT_ID_HOME_ANDROID,
  },
  game_results: {
    ios: process.env.EXPO_PUBLIC_ADMOB_BANNER_UNIT_ID_GAME_RESULTS_IOS,
    android: process.env.EXPO_PUBLIC_ADMOB_BANNER_UNIT_ID_GAME_RESULTS_ANDROID,
  },
  stats: {
    ios: process.env.EXPO_PUBLIC_ADMOB_BANNER_UNIT_ID_STATS_IOS,
    android: process.env.EXPO_PUBLIC_ADMOB_BANNER_UNIT_ID_STATS_ANDROID,
  },
  groups: {
    ios: process.env.EXPO_PUBLIC_ADMOB_BANNER_UNIT_ID_GROUPS_IOS,
    android: process.env.EXPO_PUBLIC_ADMOB_BANNER_UNIT_ID_GROUPS_ANDROID,
  },
  profile: {
    ios: process.env.EXPO_PUBLIC_ADMOB_BANNER_UNIT_ID_PROFILE_IOS,
    android: process.env.EXPO_PUBLIC_ADMOB_BANNER_UNIT_ID_PROFILE_ANDROID,
  },
};

const reportedMissingAdUnitIds = new Set<string>();

/**
 * ユニットID未設定をSentryへ警告として送る。
 * 未設定でも呼び出し側は黙って広告を出さないだけでエラーにならず、ビルド設定の
 * 漏れに気付けないまま収益がゼロになるため。ノイズを避けて枠ごとに1回だけ送る。
 *
 * @param adUnitName - 未設定だった広告枠の識別子
 */
const reportMissingAdUnitId = (adUnitName: string): void => {
  if (reportedMissingAdUnitIds.has(adUnitName)) return;
  reportedMissingAdUnitIds.add(adUnitName);
  // adUnitName は extra ではなく tag に置く。Sentry の検索・アラート条件に使えるのは
  // tag だけで、この警告は設定漏れに気付くための唯一の検知手段のため。
  // fingerprint を固定して、メッセージ文言を変えても issue が枠ごとに1本にまとまるようにする。
  Sentry.captureMessage(`AdMob ad unit id is not configured: ${adUnitName}`, {
    level: "warning",
    tags: {
      source: "admob_missing_ad_unit_id",
      adUnitName,
      platform: Platform.OS,
    },
    fingerprint: ["admob_missing_ad_unit_id", adUnitName],
  });
};

/**
 * 画面ごとのバナー広告ユニットIDを返す。未設定ならundefined。
 * 開発ビルドは常にGoogleのテスト広告ユニットを使う。誤クリックによる
 * AdMobアカウントのポリシー違反(無効なトラフィック)を防ぐため。
 *
 * @param placement - 画面を識別するプレースメント
 */
export const bannerAdUnitIdFor = (
  placement: BannerPlacement,
): string | undefined => {
  if (!isAdsEnabledPlatform()) return undefined;
  if (__DEV__) return TestIds.BANNER;
  const ids = BANNER_UNIT_ID_BY_PLACEMENT[placement];
  const unitId = Platform.OS === "ios" ? ids.ios : ids.android;
  // 空文字は ?? を素通りするため truthy で判定する。環境変数を空のまま登録すると
  // 警告が出ないまま広告枠だけ消え、このガードが検知したい状況そのものになる。
  if (unitId) return unitId;
  reportMissingAdUnitId(`banner_${placement}`);
  return undefined;
};

/**
 * ボトムナビ直上に全画面共通で常時表示するバナーのユニットIDを返す。画面ごとの
 * バナー(bannerAdUnitIdFor)とは別に、スクロール位置に関わらず常に見える枠として使う。
 */
export const bottomNavBannerAdUnitId = (): string | undefined => {
  if (!isAdsEnabledPlatform()) return undefined;
  if (__DEV__) return TestIds.BANNER;
  const unitId =
    Platform.OS === "ios"
      ? process.env.EXPO_PUBLIC_ADMOB_BANNER_UNIT_ID_BOTTOM_NAV_IOS
      : process.env.EXPO_PUBLIC_ADMOB_BANNER_UNIT_ID_BOTTOM_NAV_ANDROID;
  if (unitId) return unitId;
  reportMissingAdUnitId("banner_bottom_nav");
  return undefined;
};

/** インタースティシャル広告のユニットIDを返す。未設定ならundefined。 */
export const interstitialAdUnitId = (): string | undefined => {
  if (!isAdsEnabledPlatform()) return undefined;
  if (__DEV__) return TestIds.INTERSTITIAL;
  const unitId =
    Platform.OS === "ios"
      ? process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_UNIT_ID_IOS
      : process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_UNIT_ID_ANDROID;
  if (unitId) return unitId;
  reportMissingAdUnitId("interstitial");
  return undefined;
};

import { Platform } from "react-native";
import { TestIds } from "react-native-google-mobile-ads";

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

// 開発ビルドは常にGoogleのテスト広告ユニットを使う。誤クリックによる
// AdMobアカウントのポリシー違反(無効なトラフィック)を防ぐため。
export const bannerAdUnitIdFor = (
  placement: BannerPlacement,
): string | undefined => {
  if (__DEV__) return TestIds.BANNER;
  const ids = BANNER_UNIT_ID_BY_PLACEMENT[placement];
  return Platform.OS === "ios" ? ids.ios : ids.android;
};

export const INTERSTITIAL_AD_UNIT_ID = __DEV__
  ? TestIds.INTERSTITIAL
  : Platform.OS === "ios"
    ? process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_UNIT_ID_IOS
    : process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_UNIT_ID_ANDROID;

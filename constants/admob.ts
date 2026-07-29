import { Platform } from "react-native";
import { TestIds } from "react-native-google-mobile-ads";

// 開発ビルドは常にGoogleのテスト広告ユニットを使う。誤クリックによる
// AdMobアカウントのポリシー違反(無効なトラフィック)を防ぐため。
export const BANNER_AD_UNIT_ID = __DEV__
  ? TestIds.BANNER
  : Platform.OS === "ios"
    ? process.env.EXPO_PUBLIC_ADMOB_BANNER_UNIT_ID_IOS
    : process.env.EXPO_PUBLIC_ADMOB_BANNER_UNIT_ID_ANDROID;

export const INTERSTITIAL_AD_UNIT_ID = __DEV__
  ? TestIds.INTERSTITIAL
  : Platform.OS === "ios"
    ? process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_UNIT_ID_IOS
    : process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_UNIT_ID_ANDROID;

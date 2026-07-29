import { BannerAd, BannerAdSize } from "react-native-google-mobile-ads";
import { BANNER_AD_UNIT_ID } from "@constants/admob";
import { useEntitlement } from "@hooks/useEntitlement";

/**
 * ボトムナビの5タブ(Home/試合結果/成績/グループ/マイページ)のルート画面
 * 直下にのみ配置するバナー広告。Pro加入者(no_ads entitlement)には表示しない。
 * ネストされた画面(詳細・入力・編集等)には配置しない方針のため、この
 * コンポーネント自体を各ルート画面以外にimportしないこと。
 */
export function AppBannerAd() {
  const { hasEntitlement } = useEntitlement();
  if (hasEntitlement("no_ads") || !BANNER_AD_UNIT_ID) return null;

  return (
    <BannerAd
      unitId={BANNER_AD_UNIT_ID}
      size={BannerAdSize.BANNER}
      requestOptions={{ requestNonPersonalizedAdsOnly: false }}
    />
  );
}

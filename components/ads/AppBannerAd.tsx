import type { BannerPlacement } from "@constants/admob";
import { BannerAd, BannerAdSize } from "react-native-google-mobile-ads";
import { bannerAdUnitIdFor } from "@constants/admob";
import { useEntitlement } from "@hooks/useEntitlement";

interface AppBannerAdProps {
  /** 画面ごとに広告ユニットを分けるための識別子。 */
  placement: BannerPlacement;
}

/**
 * ボトムナビの5タブ(Home/試合結果/成績/グループ/マイページ)のルート画面
 * 直下にのみ配置するバナー広告。画面ごとに別の広告ユニットIDを使う。
 * Pro加入者(no_ads entitlement)には表示しない。ネストされた画面
 * (詳細・入力・編集等)には配置しない方針のため、このコンポーネント自体を
 * 各ルート画面以外にimportしないこと。
 */
export function AppBannerAd({ placement }: AppBannerAdProps) {
  const { hasEntitlement } = useEntitlement();
  const unitId = bannerAdUnitIdFor(placement);
  if (hasEntitlement("no_ads") || !unitId) return null;

  return (
    <BannerAd
      unitId={unitId}
      size={BannerAdSize.BANNER}
      requestOptions={{ requestNonPersonalizedAdsOnly: false }}
    />
  );
}

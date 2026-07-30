import type { BannerPlacement } from "@constants/admob";
import { BannerAd, BannerAdSize } from "react-native-google-mobile-ads";
import { bannerAdUnitIdFor } from "@constants/admob";
import { useEntitlement } from "@hooks/useEntitlement";

interface InlineBannerAdProps {
  /** 画面ごとに広告ユニットを分けるための識別子。 */
  placement: BannerPlacement;
}

/**
 * 各画面のスクロール領域の末尾（一番下までスクロールした先）に表示する、
 * 画面専用のバナー広告。ボトムナビ直上に常時表示する`AppBannerAd`(全画面
 * 共通)とは別に、画面ごとの広告ユニットIDを使う。Pro加入者
 * (no_ads entitlement)には表示しない。
 */
export function InlineBannerAd({ placement }: InlineBannerAdProps) {
  const { hasEntitlement } = useEntitlement();
  const unitId = bannerAdUnitIdFor(placement);
  if (hasEntitlement("no_ads") || !unitId) return null;

  return (
    <BannerAd
      unitId={unitId}
      size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
      requestOptions={{ requestNonPersonalizedAdsOnly: false }}
    />
  );
}

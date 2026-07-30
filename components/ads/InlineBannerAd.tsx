import type { BannerPlacement } from "@constants/admob";
import { StyleSheet, View } from "react-native";
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
 * 共通、横長のアンカー型)とは見た目を変え、フィード末尾に馴染む
 * MEDIUM_RECTANGLE(300x250)を使う。Pro加入者(no_ads entitlement)には
 * 表示しない。
 */
export function InlineBannerAd({ placement }: InlineBannerAdProps) {
  const { hasEntitlement } = useEntitlement();
  const unitId = bannerAdUnitIdFor(placement);
  if (hasEntitlement("no_ads") || !unitId) return null;

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={unitId}
        size={BannerAdSize.MEDIUM_RECTANGLE}
        requestOptions={{ requestNonPersonalizedAdsOnly: false }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", marginVertical: 8 },
});

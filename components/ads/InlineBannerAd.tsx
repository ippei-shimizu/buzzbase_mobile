import type { BannerPlacement } from "@constants/admob";
import { useSyncExternalStore } from "react";
import { StyleSheet, View } from "react-native";
import { BannerAd, BannerAdSize } from "react-native-google-mobile-ads";
import { bannerAdUnitIdFor } from "@constants/admob";
import { useEntitlement } from "@hooks/useEntitlement";
import {
  getMobileAdsInitialized,
  subscribeMobileAdsInitialized,
} from "@services/mobileAdsService";

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
  const { hasEntitlement, isLoading } = useEntitlement();
  // BannerAd は失敗しても再ロードしないため、SDK初期化前にマウントされると
  // その画面が生きている間ずっと空枠のままになる。初期化完了まで描画を待つ。
  const isAdsInitialized = useSyncExternalStore(
    subscribeMobileAdsInitialized,
    getMobileAdsInitialized,
  );
  // Pro状態確定前はhasEntitlementが常にfalse(無料扱い)になるため、
  // isLoading中も広告を出さないことでPro加入者への一瞬の広告フラッシュを防ぐ。
  if (isLoading || hasEntitlement("no_ads") || !isAdsInitialized) return null;

  // ユニットIDの取得はPro判定の後に行う。未設定時のSentry警告がPro加入者の
  // 表示されない枠にまで出るのを避けるため。
  // これはレンダー中の副作用になるが、未設定の報告は枠ごとに1回だけ送るよう
  // dedupe されているため、StrictMode の二重レンダーでも多重送信にならない。
  const unitId = bannerAdUnitIdFor(placement);
  if (!unitId) return null;

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={unitId}
        size={BannerAdSize.MEDIUM_RECTANGLE}
        // ATT拒否時はiOS側がIDFAアクセス自体をブロックするため、この値に
        // 関わらずGoogle側で非パーソナライズ配信にフォールバックする。ターゲットは
        // 現状日本国内が主軸でEEA/GDPR圏のUMP同意管理は対象外のため、ATTの
        // 許諾結果をここに反映する対応は見送っている(EEA展開時に要再検討)。
        requestOptions={{ requestNonPersonalizedAdsOnly: false }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", marginVertical: 8 },
});

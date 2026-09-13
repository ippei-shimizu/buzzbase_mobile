import { useSyncExternalStore } from "react";
import { BannerAd, BannerAdSize } from "react-native-google-mobile-ads";
import { bottomNavBannerAdUnitId } from "@constants/admob";
import { useEntitlement } from "@hooks/useEntitlement";
import {
  getMobileAdsInitialized,
  subscribeMobileAdsInitialized,
} from "@services/mobileAdsService";

/**
 * ボトムナビの5タブ(Home/試合結果/成績/グループ/マイページ)のルート画面
 * 直下に、全画面共通で常時表示するバナー広告(Banner - Bottom Nav)。
 * スクロール位置に関わらず常に見える固定枠として、各画面のスクロール領域
 * (flex:1)の直後に配置する。Pro加入者(no_ads entitlement)には表示しない。
 * ネストされた画面(詳細・入力・編集等)には配置しない方針のため、この
 * コンポーネント自体を各ルート画面以外にimportしないこと。
 * 画面ごとの広告は`InlineBannerAd`を使う。
 */
export function AppBannerAd() {
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
  const unitId = bottomNavBannerAdUnitId();
  if (!unitId) return null;

  return (
    <BannerAd
      unitId={unitId}
      // 固定320x50のBANNERだと横幅の広い端末で画面いっぱいにならないため、
      // 画面幅に応じて自動調整されるアンカー型アダプティブバナーを使う。
      // LARGE版は高さも大きく画面を圧迫するため、通常サイズの方を使う。
      size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
      // ATT拒否時はiOS側がIDFAアクセス自体をブロックするため、この値に
      // 関わらずGoogle側で非パーソナライズ配信にフォールバックする。ターゲットは
      // 現状日本国内が主軸でEEA/GDPR圏のUMP同意管理は対象外のため、ATTの
      // 許諾結果をここに反映する対応は見送っている(EEA展開時に要再検討)。
      requestOptions={{ requestNonPersonalizedAdsOnly: false }}
    />
  );
}

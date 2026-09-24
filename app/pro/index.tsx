import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { toProTrigger } from "@components/pro/paywall/paywallContent";
import { PaywallFlow } from "@components/pro/paywall/PaywallFlow";
import { PaywallHeader } from "@components/pro/paywall/PaywallHeader";
import { usePaywallPurchase } from "@components/pro/paywall/usePaywallPurchase";
import { usePaywallSteps } from "@components/pro/paywall/usePaywallSteps";
import { useProStatus } from "@hooks/useProStatus";
import { trackPaywallViewed } from "@utils/analytics";

/**
 * 設定・特商法ページなどから開く Pro プラン画面。
 * PaywallModal と同じ 2 ステップ構成（価値訴求 → プラン選択）を全画面で表示する。
 */
export default function ProScreen() {
  const router = useRouter();
  // 遷移元が Pro 訴求のどの機能だったかを課金ファネルの trigger として引き継ぐ。
  const { trigger: triggerParam } = useLocalSearchParams<{
    trigger?: string;
  }>();
  const trigger = toProTrigger(triggerParam);
  // fullScreenModal で表示すると SafeAreaView の top inset が反映されないことがあるため、
  // useSafeAreaInsets で取得して直接 paddingTop に適用する。
  const insets = useSafeAreaInsets();
  // 既に使い切ったユーザーに「7日間無料」と誤案内しないため、CTAまわりの文言はここで出し分ける。
  // 判定確定前（isLoading）は DEFAULT_PRO_STATUS（has_used_trial: false）にフォールバックし
  // isTrialEligible が常に true になるため、確定するまではトライアル訴求を一切出さない。
  const { proStatus, isLoading: isProStatusLoading } = useProStatus();
  const isTrialEligible =
    !isProStatusLoading && !proStatus.subscription.has_used_trial;
  // この画面は設定などから加入済みユーザーも開けるため、課金ファネルの分母に
  // 加入済みを混ぜない（判定確定前も送らない）。
  const countsAsFunnel =
    !isProStatusLoading && !proStatus.subscription.pro_active;

  const { step, goToPlan, goToFeatures, goToValue, trackDismiss } =
    usePaywallSteps({
      trigger,
      active: countsAsFunnel,
    });

  useEffect(() => {
    if (countsAsFunnel) trackPaywallViewed(trigger);
  }, [countsAsFunnel, trigger]);

  const purchase = usePaywallPurchase({
    trigger,
    enabled: true,
    onPurchased: () => router.replace("/pro/success"),
    onRestored: () => router.back(),
  });

  // 購入せずに閉じた場合だけ離脱として記録する。
  const handleDismiss = () => {
    if (countsAsFunnel) trackDismiss();
    router.back();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <PaywallHeader
        showBack={step !== "value"}
        onBack={goToValue}
        onClose={handleDismiss}
      />

      <PaywallFlow
        trigger={trigger}
        step={step}
        goToPlan={goToPlan}
        goToFeatures={goToFeatures}
        purchase={purchase}
        isTrialEligible={isTrialEligible}
        isProStatusLoading={isProStatusLoading}
        onNavigateAway={() => {}}
        bottomInset={Math.max(insets.bottom, 24)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2E2E2E",
  },
});

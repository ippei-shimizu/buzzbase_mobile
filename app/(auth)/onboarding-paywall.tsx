import type { PaywallPlacement } from "@utils/analytics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef } from "react";
import { BackHandler, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { toProTrigger } from "@components/pro/paywall/paywallContent";
import { PaywallFlow } from "@components/pro/paywall/PaywallFlow";
import { PaywallHeader } from "@components/pro/paywall/PaywallHeader";
import { usePaywallPurchase } from "@components/pro/paywall/usePaywallPurchase";
import { usePaywallSteps } from "@components/pro/paywall/usePaywallSteps";
import { useProStatus } from "@hooks/useProStatus";
import { trackPaywallViewed } from "@utils/analytics";

const PLACEMENT: PaywallPlacement = "onboarding";

/**
 * 登録直後（プロフィール入力の後）に一度だけ表示する Paywall。
 * 設定から開く Pro 画面（app/pro）と同じ2ステップ構成を共有し、閉じても購入しても
 * ダッシュボードへ抜ける点だけが異なる。
 *
 * 加入済み・購入不可のときは何も出さずダッシュボードへ送る。自動表示なので、
 * 買えるものが無い画面をユーザーに見せない。
 */
export default function OnboardingPaywallScreen() {
  const router = useRouter();
  const { trigger: triggerParam } = useLocalSearchParams<{
    trigger?: string;
  }>();
  const trigger = toProTrigger(triggerParam);
  const insets = useSafeAreaInsets();
  const isLeavingRef = useRef(false);

  const { proStatus, isLoading: isProStatusLoading } = useProStatus();
  const isTrialEligible =
    !isProStatusLoading && !proStatus.subscription.has_used_trial;
  const isAlreadyPro = !isProStatusLoading && proStatus.subscription.pro_active;
  // 判定確定まではファネルの分母に入れない（確定前に閉じられた分を離脱として数えない）。
  const countsAsFunnel = !isProStatusLoading && !isAlreadyPro;

  const leave = useCallback(() => {
    if (isLeavingRef.current) return;
    isLeavingRef.current = true;
    router.replace("/(tabs)");
  }, [router]);

  const { step, goToPlan, goToFeatures, goToValue, trackDismiss } =
    usePaywallSteps({
      trigger,
      active: countsAsFunnel,
      placement: PLACEMENT,
    });

  useEffect(() => {
    if (countsAsFunnel) trackPaywallViewed(trigger, PLACEMENT);
  }, [countsAsFunnel, trigger]);

  // 加入済みユーザーには出さない。判定が確定してから抜ける。
  useEffect(() => {
    if (isAlreadyPro) leave();
  }, [isAlreadyPro, leave]);

  // 戻って未完了の登録画面に着地させない。閉じる導線はヘッダーに用意する。
  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => true,
    );
    return () => subscription.remove();
  }, []);

  const purchase = usePaywallPurchase({
    trigger,
    placement: PLACEMENT,
    enabled: !isAlreadyPro,
    onPurchased: () => router.replace("/pro/success"),
    onRestored: leave,
  });

  // 自動表示なので、買えるものが1つも無い画面は見せずに抜ける。
  // 取得中（loadingOfferings）は待ち、確定してから判定する。
  useEffect(() => {
    if (isProStatusLoading || purchase.loadingOfferings) return;
    if (purchase.packages.length === 0) leave();
  }, [
    isProStatusLoading,
    purchase.loadingOfferings,
    purchase.packages.length,
    leave,
  ]);

  const handleDismiss = () => {
    if (countsAsFunnel) trackDismiss();
    leave();
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
        placement={PLACEMENT}
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

import type { Feature } from "../../types/pro";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Modal, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useProStatus } from "@hooks/useProStatus";
import { trackPaywallViewed } from "@utils/analytics";
import { toProTrigger } from "./paywall/paywallContent";
import { PaywallFlow } from "./paywall/PaywallFlow";
import { PaywallHeader } from "./paywall/PaywallHeader";
import { usePaywallPurchase } from "./paywall/usePaywallPurchase";
import { usePaywallSteps } from "./paywall/usePaywallSteps";

// 訴求コピー・比較表・課金ヘルパーは paywall/paywallContent に集約したが、
// 既存の呼び出し側（ProUpsellCard / app/pro / 各画面）が参照し続けられるよう再公開する。
export * from "./paywall/paywallContent";

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  /**
   * ハイライト表示する Pro 機能。未指定（リリース前の告知UIなど、まだ entitlement
   * キーを持たない機能からの呼び出し）の場合は汎用コピーのみを表示する。
   */
  feature?: Feature;
  /**
   * 「なぜ今このモーダルが表示されているか」を伝える状況説明。
   * 上限到達時などピンポイントな事実（例:
   * 「今月の無料上限（3件）に達したため、1件は保存できませんでした」）を渡す。
   * 未指定時はこのモーダルが持つ汎用の機能訴求のみを表示する。
   */
  contextMessage?: string;
}

/**
 * Pro 機能への加入を促す全画面モーダル。
 * 価値訴求（機能紹介のスライドショー）と価格提示を別ステップに分け、
 * 支払いを求める前に「何ができるようになるか」だけを見せる。
 */
export function PaywallModal({
  isOpen,
  onClose,
  feature,
  contextMessage,
}: PaywallModalProps) {
  const router = useRouter();
  // 全画面表示のため、ヘッダーと CTA がノッチ・ホームバーに被らないよう inset を直接当てる。
  const insets = useSafeAreaInsets();
  // 既に使い切ったユーザーに「7日間無料」と誤案内しないため、CTAまわりの文言はここで出し分ける。
  // 判定確定前（isLoading）は DEFAULT_PRO_STATUS（has_used_trial: false）にフォールバックし
  // isTrialEligible が常に true になるため、確定するまではトライアル訴求を一切出さない。
  const { proStatus, isLoading: isProStatusLoading } = useProStatus();
  const isTrialEligible =
    !isProStatusLoading && !proStatus.subscription.has_used_trial;
  const trigger = toProTrigger(feature);
  const { step, goToPlan, goToFeatures, goToValue, trackDismiss } =
    usePaywallSteps({
      trigger,
      active: isOpen,
    });

  useEffect(() => {
    if (isOpen) trackPaywallViewed(trigger);
  }, [isOpen, trigger]);

  const purchase = usePaywallPurchase({
    trigger,
    enabled: isOpen,
    onPurchased: () => {
      onClose();
      router.push("/pro/success");
    },
    onRestored: onClose,
  });

  // 購入せずに閉じた場合だけ離脱として記録する（購入成功時は onPurchased 経由で閉じる）。
  const handleDismiss = () => {
    trackDismiss();
    onClose();
  };

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      presentationStyle="fullScreen"
      statusBarTranslucent
      onRequestClose={handleDismiss}
    >
      <View
        style={[styles.container, { paddingTop: Math.max(insets.top, 12) }]}
        accessibilityViewIsModal
      >
        <PaywallHeader
          showBack={step !== "value"}
          onBack={goToValue}
          onClose={handleDismiss}
        />
        <PaywallFlow
          feature={feature}
          contextMessage={contextMessage}
          trigger={trigger}
          step={step}
          goToPlan={goToPlan}
          goToFeatures={goToFeatures}
          purchase={purchase}
          isTrialEligible={isTrialEligible}
          isProStatusLoading={isProStatusLoading}
          onNavigateAway={onClose}
          bottomInset={Math.max(insets.bottom, 24)}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2E2E2E",
  },
});

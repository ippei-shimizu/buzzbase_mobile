import type { Feature } from "../../types/pro";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Icon } from "@components/icon/Icon";
import { useProStatus } from "@hooks/useProStatus";
import { trackPaywallViewed } from "@utils/analytics";
import { toProTrigger } from "./paywall/paywallContent";
import { PaywallFlow } from "./paywall/PaywallFlow";
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
 * Pro 機能への加入を促す下からせり出すシート型モーダル。
 * 価値訴求（トリガー機能の図と説明）と価格提示を別ステップに分け、
 * 支払いを求める前に「何ができるようになるか」だけを見せる。
 */
export function PaywallModal({
  isOpen,
  onClose,
  feature,
  contextMessage,
}: PaywallModalProps) {
  const router = useRouter();
  // 既に使い切ったユーザーに「7日間無料」と誤案内しないため、CTAまわりの文言はここで出し分ける。
  // 判定確定前（isLoading）は DEFAULT_PRO_STATUS（has_used_trial: false）にフォールバックし
  // isTrialEligible が常に true になるため、確定するまではトライアル訴求を一切出さない。
  const { proStatus, isLoading: isProStatusLoading } = useProStatus();
  const isTrialEligible =
    !isProStatusLoading && !proStatus.subscription.has_used_trial;
  const trigger = toProTrigger(feature);
  const { step, goToPlan, goToValue, trackDismiss } = usePaywallSteps({
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
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={handleDismiss}
    >
      <View style={styles.overlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={handleDismiss}
          accessibilityLabel="ペイウォールを閉じる"
        />
        <View style={styles.sheet} accessibilityViewIsModal>
          {step === "plan" ? (
            <TouchableOpacity
              onPress={goToValue}
              style={styles.backButton}
              accessibilityRole="button"
              accessibilityLabel="戻る"
              hitSlop={8}
            >
              <Icon name="chevron-back" size={22} color="#F4F4F4" />
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            onPress={handleDismiss}
            style={styles.closeButton}
            accessibilityRole="button"
            accessibilityLabel="閉じる"
            hitSlop={8}
          >
            <Icon name="close" size={22} color="#F4F4F4" />
          </TouchableOpacity>

          <PaywallFlow
            feature={feature}
            contextMessage={contextMessage}
            trigger={trigger}
            step={step}
            goToPlan={goToPlan}
            purchase={purchase}
            isTrialEligible={isTrialEligible}
            isProStatusLoading={isProStatusLoading}
            onNavigateAway={onClose}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    justifyContent: "flex-end",
  },
  sheet: {
    maxHeight: "88%",
    backgroundColor: "#2E2E2E",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 16,
    zIndex: 1,
    padding: 4,
  },
  backButton: {
    position: "absolute",
    top: 12,
    left: 16,
    zIndex: 1,
    padding: 4,
  },
});

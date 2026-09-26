import type { PaywallSlideKey } from "@components/pro/paywall/PaywallSlides";
import type { PaywallPlacement, ProTrigger } from "@utils/analytics";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef } from "react";
import { ActivityIndicator, BackHandler, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PaywallFlow } from "@components/pro/paywall/PaywallFlow";
import { PaywallHeader } from "@components/pro/paywall/PaywallHeader";
import { usePaywallPurchase } from "@components/pro/paywall/usePaywallPurchase";
import { usePaywallSteps } from "@components/pro/paywall/usePaywallSteps";
import { useProStatus } from "@hooks/useProStatus";
import { trackPaywallViewed } from "@utils/analytics";

const PLACEMENT: PaywallPlacement = "onboarding";

// 機能をタップして来た訳ではないため、機能キーを trigger に載せない。
// 訴求の出し分けは leadSlide で行う。
const TRIGGER: ProTrigger = "general";

const LEAD_SLIDES: readonly PaywallSlideKey[] = [
  "hit_direction",
  "pitch_course",
  "pitcher_faceoff",
  "pitch_type",
  "count_situation",
  "season_trend",
  "no_ads",
];

const toLeadSlide = (value: string | undefined): PaywallSlideKey | undefined =>
  LEAD_SLIDES.find((slide) => slide === value);

/**
 * 登録直後（プロフィール入力の後）に一度だけ表示する Paywall。
 * 設定から開く Pro 画面（app/pro）と同じ2ステップ構成を共有し、閉じても購入しても
 * ダッシュボードへ抜ける点だけが異なる。
 *
 * 加入済み・購入できるプランが無いときは何も描画せずダッシュボードへ送る。自動表示なので、
 * 買えるものが無い画面を見せないことと、判定中にちらつかせないことを優先する。
 */
export default function OnboardingPaywallScreen() {
  const router = useRouter();
  const { leadSlide: leadSlideParam } = useLocalSearchParams<{
    leadSlide?: string;
  }>();
  const leadSlide = toLeadSlide(leadSlideParam);
  const insets = useSafeAreaInsets();
  const isLeavingRef = useRef(false);

  const { proStatus, isLoading: isProStatusLoading } = useProStatus();
  const isTrialEligible =
    !isProStatusLoading && !proStatus.subscription.has_used_trial;
  const isAlreadyPro = !isProStatusLoading && proStatus.subscription.pro_active;

  const leave = useCallback(() => {
    if (isLeavingRef.current) return;
    isLeavingRef.current = true;
    router.replace("/(tabs)");
  }, [router]);

  const purchase = usePaywallPurchase({
    trigger: TRIGGER,
    placement: PLACEMENT,
    enabled: !isAlreadyPro,
    onPurchased: () => router.replace("/pro/success"),
    onRestored: leave,
  });

  // 買えるプランが確定してから分母に入れる。取得失敗・0件で抜けた分を
  // 「見たのに買わなかった」として数えると、この配置だけ CVR が不当に下がる。
  const isDecided = !isProStatusLoading && !purchase.loadingOfferings;
  const canShowPaywall =
    isDecided && !isAlreadyPro && purchase.packages.length > 0;

  const { step, goToPlan, goToFeatures, goToValue, trackDismiss } =
    usePaywallSteps({
      trigger: TRIGGER,
      active: canShowPaywall,
      placement: PLACEMENT,
    });

  useEffect(() => {
    if (canShowPaywall) {
      trackPaywallViewed({
        trigger: TRIGGER,
        placement: PLACEMENT,
        lead_slide: leadSlide,
      });
    }
  }, [canShowPaywall, leadSlide]);

  // 出さないと確定したらダッシュボードへ抜ける。
  useEffect(() => {
    if (isDecided && !canShowPaywall) leave();
  }, [isDecided, canShowPaywall, leave]);

  // 戻って未完了の登録画面に着地させない。閉じる導線はヘッダーに用意する。
  // 規約などを push した先の戻るまで飲み込まないよう、フォーカス中だけ登録する。
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        () => true,
      );
      return () => subscription.remove();
    }, []),
  );

  const handleDismiss = () => {
    // 連打で paywall dismissed が重複しないよう、遷移のガードより先に判定する。
    if (isLeavingRef.current) return;
    trackDismiss();
    leave();
  };

  if (!canShowPaywall) {
    return (
      <View
        style={[styles.container, styles.centered, { paddingTop: insets.top }]}
      >
        <ActivityIndicator size="large" color="#d08000" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <PaywallHeader
        showBack={step !== "value"}
        onBack={goToValue}
        onClose={handleDismiss}
      />

      <PaywallFlow
        trigger={TRIGGER}
        placement={PLACEMENT}
        leadSlide={leadSlide}
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
  centered: {
    alignItems: "center",
    justifyContent: "center",
  },
});

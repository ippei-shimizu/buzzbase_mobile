import type { PaywallStepName, ProTrigger } from "@utils/analytics";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  trackPaywallDismissed,
  trackPaywallStepViewed,
} from "@utils/analytics";

/** Paywall のステップ。value = 価値訴求、features = 全機能一覧、plan = 価格とプラン選択。 */
export type PaywallStep = PaywallStepName;

interface UsePaywallStepsOptions {
  trigger: ProTrigger;
  /** Paywall が表示中かつ課金ファネルの分母に含めてよいとき true。 */
  active: boolean;
}

/**
 * Paywall の 2 ステップ遷移と、その通過・離脱の計測をまとめて扱う。
 *
 * 離脱計測はオーバーレイ押下や端末の戻るなど Paywall 本体の外からも呼ばれるため、
 * 現在のステップは state と同時に ref にも持ち、同期的に読めるようにしている。
 *
 * @returns 現在のステップと、遷移・離脱を計測付きで行うハンドラ
 */
export function usePaywallSteps({ trigger, active }: UsePaywallStepsOptions) {
  const [step, setStepState] = useState<PaywallStep>("value");
  const stepRef = useRef<PaywallStep>("value");

  const setStep = useCallback((next: PaywallStep) => {
    stepRef.current = next;
    setStepState(next);
  }, []);

  // 閉じて開き直したときは価値訴求からやり直す。
  useEffect(() => {
    if (!active) setStep("value");
  }, [active, setStep]);

  useEffect(() => {
    if (active) trackPaywallStepViewed({ step, trigger });
  }, [active, step, trigger]);

  const goToPlan = useCallback(() => setStep("plan"), [setStep]);
  const goToFeatures = useCallback(() => setStep("features"), [setStep]);
  const goToValue = useCallback(() => setStep("value"), [setStep]);

  /** 購入に至らず閉じたときに呼ぶ。どのステップで離脱したかを計測する。 */
  const trackDismiss = useCallback(() => {
    trackPaywallDismissed({ step: stepRef.current, trigger });
  }, [trigger]);

  return { step, goToPlan, goToFeatures, goToValue, trackDismiss };
}

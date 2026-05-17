import { useCallback } from "react";
import { useProStatus } from "@hooks/useProStatus";
import { FREE_FEATURES, type Feature } from "../types/pro";

/**
 * 機能アクセス権（Entitlement）を判定するフック。
 * 無料機能は常に true、Pro 機能は subscription.entitlements に含まれていれば true。
 * back の Entitlement#has_entitlement? と同じロジックを表現する。
 */
export const useEntitlement = () => {
  const { proStatus, isPro } = useProStatus();

  const hasEntitlement = useCallback(
    (feature: Feature): boolean => {
      if ((FREE_FEATURES as readonly string[]).includes(feature)) return true;
      return proStatus.entitlements.includes(feature);
    },
    [proStatus.entitlements],
  );

  return {
    isPro,
    inTrial: proStatus.subscription.in_trial,
    inGracePeriod: proStatus.subscription.in_grace_period,
    hasEntitlement,
  };
};

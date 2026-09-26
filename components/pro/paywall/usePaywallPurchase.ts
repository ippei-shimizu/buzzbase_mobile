import type { PaywallPlacement, ProTrigger } from "@utils/analytics";
import * as Sentry from "@sentry/react-native";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import {
  PURCHASES_ERROR_CODE,
  type PurchasesOffering,
} from "react-native-purchases";
import { syncProStatus } from "@services/proService";
import {
  getOfferings,
  purchasePackage,
  restorePurchases,
} from "@services/revenueCatService";
import { useSnackbarStore } from "@stores/snackbarStore";
import {
  trackPurchaseCompleted,
  trackPurchaseFailed,
  trackUpgradeStarted,
} from "@utils/analytics";
import {
  isTrialPurchase,
  isUserCancelled,
  purchaseFailureReason,
  toPlanType,
} from "./paywallContent";

interface UsePaywallPurchaseOptions {
  trigger: ProTrigger;
  placement: PaywallPlacement;
  /** Offering の取得を開始してよいか。モーダルは開いている間だけ true にする。 */
  enabled: boolean;
  /** 購入完了かつ Pro 状態の同期後に呼ばれる。成功画面への遷移を担当する。 */
  onPurchased: () => void;
  /** 復元対象があったときに呼ばれる。画面を閉じる・戻る処理を担当する。 */
  onRestored: () => void;
}

/**
 * Paywall の Offering 取得・購入・復元をまとめたフック。
 * モーダル（PaywallModal）と Pro 画面（app/pro）で同じ課金処理を共有し、
 * 計測とエラーハンドリングの差異が生まれないようにする。
 */
export function usePaywallPurchase({
  trigger,
  placement,
  enabled,
  onPurchased,
  onRestored,
}: UsePaywallPurchaseOptions) {
  const queryClient = useQueryClient();
  const showSnackbar = useSnackbarStore((s) => s.show);
  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [loadingOfferings, setLoadingOfferings] = useState(enabled);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(
    null,
  );
  // 多重起動の判定は、レンダーを跨がず同期的に読める ref で行う。課金・復元は
  // 非冪等な操作のため、state の反映タイミングに依存させない。UI 表示用の state は
  // ref と常に同時更新するので、呼び出し側は従来どおり purchasing / restoring を使う。
  const purchasingRef = useRef(false);
  const restoringRef = useRef(false);
  const [purchasing, setPurchasingState] = useState(false);
  const [restoring, setRestoringState] = useState(false);
  const setPurchasing = (value: boolean) => {
    purchasingRef.current = value;
    setPurchasingState(value);
  };
  const setRestoring = (value: boolean) => {
    restoringRef.current = value;
    setRestoringState(value);
  };

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    setLoadingOfferings(true);
    void (async () => {
      try {
        const result = await getOfferings();
        if (cancelled) return;
        setOffering(result);
        const availablePackages = result?.availablePackages ?? [];
        // 年額があれば「お得」導線として初期選択にする。無ければ最初のプランを選ぶ。
        const preferred =
          availablePackages.find((pkg) => pkg.packageType === "ANNUAL") ??
          availablePackages[0];
        setSelectedPackageId(preferred?.identifier ?? null);
      } catch (error: unknown) {
        // RevenueCat 側の商品未登録・App Store Connect 未反映などで取得失敗しても、
        // Paywall 自体は表示を続け、プラン欄のみ空状態表示にフォールバックする。
        if (!cancelled) {
          Sentry.captureException(error, {
            tags: { source: "revenue_cat_get_offerings" },
          });
        }
      } finally {
        if (!cancelled) setLoadingOfferings(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  const packages = offering?.availablePackages ?? [];
  const selectedPackage =
    packages.find((pkg) => pkg.identifier === selectedPackageId) ?? null;
  const monthlyPackage = packages.find((pkg) => pkg.packageType === "MONTHLY");
  const annualPackage = packages.find((pkg) => pkg.packageType === "ANNUAL");
  const annualIsDiscounted =
    !!monthlyPackage &&
    !!annualPackage &&
    annualPackage.product.price < monthlyPackage.product.price * 12;
  // 月額を1年間払い続けた場合と比べて年額プランがいくら安いかを金額で表示する。
  const annualSavingsAmount =
    annualIsDiscounted && monthlyPackage && annualPackage
      ? monthlyPackage.product.price * 12 - annualPackage.product.price
      : null;
  // お得額はストアの通貨で出す必要があるため、算出元の通貨コードも一緒に返す。
  const annualCurrencyCode = annualPackage?.product.currencyCode ?? null;

  const handlePurchase = async () => {
    // disabled プロパティだけに頼らず、連打による purchasePackage の多重起動を関数側でも防ぐ。
    if (!selectedPackage || purchasingRef.current) return;
    const planType = toPlanType(selectedPackage.packageType);
    setPurchasing(true);
    trackUpgradeStarted({ plan_type: planType, trigger, placement });
    let purchasedCustomerInfo;
    try {
      purchasedCustomerInfo = await purchasePackage(selectedPackage);
    } catch (error: unknown) {
      setPurchasing(false);
      if (isUserCancelled(error)) {
        trackPurchaseFailed({
          reason: "user_cancelled",
          plan_type: planType,
          placement,
        });
        return;
      }
      const code = (error as { code?: PURCHASES_ERROR_CODE })?.code;
      trackPurchaseFailed({
        reason: purchaseFailureReason(code),
        plan_type: planType,
        placement,
      });
      if (code === PURCHASES_ERROR_CODE.PAYMENT_PENDING_ERROR) {
        showSnackbar({
          type: "info",
          message:
            "お支払いが保留中です。承認が完了し次第、Proが有効になります",
        });
        return;
      }
      if (code === PURCHASES_ERROR_CODE.PRODUCT_ALREADY_PURCHASED_ERROR) {
        showSnackbar({
          type: "info",
          message: "既に購入済みです。「購入を復元」をお試しください",
        });
        return;
      }
      if (code === PURCHASES_ERROR_CODE.PURCHASE_NOT_ALLOWED_ERROR) {
        // スクリーンタイム等の端末側制限が原因で、リトライしても解決しないため
        // 設定確認を促す文言に分ける。発生頻度の把握のため Sentry への送信は維持する。
        Sentry.captureException(error, {
          tags: { source: "revenue_cat_purchase" },
        });
        showSnackbar({
          type: "error",
          message:
            "この端末ではアプリ内課金が制限されています。スクリーンタイムなどの設定をご確認ください",
        });
        return;
      }
      Sentry.captureException(error, {
        tags: { source: "revenue_cat_purchase" },
      });
      showSnackbar({
        type: "error",
        message: "購入に失敗しました。時間を置いて再度お試しください",
      });
      return;
    }

    trackPurchaseCompleted({
      plan_type: planType,
      platform: Platform.OS === "android" ? "android" : "ios",
      is_trial: isTrialPurchase(purchasedCustomerInfo),
      placement,
    });

    // ここから先は Apple への課金が既に成功している。バックエンドへの同期失敗を
    // 「購入失敗」と誤表示すると二重購入を誘発するため、Sentry への記録に留めて
    // 成功画面へ進める（Pro 状態は webhook / 次回起動時の同期でも回復する）。
    try {
      await syncProStatus();
    } catch (error: unknown) {
      Sentry.captureException(error, {
        tags: { source: "revenue_cat_purchase_sync" },
      });
    }
    await queryClient.invalidateQueries({ queryKey: ["pro", "status"] });
    setPurchasing(false);
    onPurchased();
  };

  const handleRestore = async () => {
    // disabled プロパティだけに頼らず、連打による restorePurchases の多重起動を関数側でも防ぐ。
    if (restoringRef.current) return;
    setRestoring(true);
    let customerInfo;
    try {
      customerInfo = await restorePurchases();
    } catch {
      setRestoring(false);
      showSnackbar({
        type: "error",
        message: "復元に失敗しました。時間を置いて再度お試しください",
      });
      return;
    }

    // ここから先は RevenueCat 上の復元が既に成功している。purchase と同様、
    // バックエンドへの同期失敗を「復元失敗」と誤表示せず Sentry 記録に留める
    // （Pro 状態は webhook / 次回起動時の同期でも回復する）。
    try {
      await syncProStatus();
    } catch (error: unknown) {
      Sentry.captureException(error, {
        tags: { source: "revenue_cat_restore_sync" },
      });
    }
    await queryClient.invalidateQueries({ queryKey: ["pro", "status"] });
    setRestoring(false);

    // 復元対象が 0 件でも restorePurchases 自体は成功するため、
    // active な entitlement の有無で成功メッセージと出し分ける。
    const hasActiveEntitlement =
      Object.keys(customerInfo.entitlements.active).length > 0;
    if (hasActiveEntitlement) {
      showSnackbar({ type: "success", message: "購入情報を復元しました" });
      onRestored();
    } else {
      showSnackbar({
        type: "info",
        message: "復元できる購入情報がありませんでした",
      });
    }
  };

  return {
    packages,
    loadingOfferings,
    selectedPackage,
    selectedPackageId,
    setSelectedPackageId,
    annualIsDiscounted,
    annualSavingsAmount,
    annualCurrencyCode,
    purchasing,
    restoring,
    handlePurchase,
    handleRestore,
  };
}

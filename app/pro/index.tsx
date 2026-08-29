import * as Sentry from "@sentry/react-native";
import { useQueryClient } from "@tanstack/react-query";
import { Redirect, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  PURCHASES_ERROR_CODE,
  type PurchasesOffering,
} from "react-native-purchases";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "@components/icon/Icon";
import {
  DEFAULT_COPY,
  FEATURE_COMPARISONS,
  FEATURE_GROUPS,
  isUserCancelled,
  PLAN_LABELS,
  PRO_PAYWALL_COPY,
} from "@components/pro/PaywallModal";
import { useFeatureFlag } from "@hooks/useFeatureFlag";
import { useProStatus } from "@hooks/useProStatus";
import { syncProStatus } from "@services/proService";
import {
  getOfferings,
  purchasePackage,
  restorePurchases,
} from "@services/revenueCatService";
import { useSnackbarStore } from "@stores/snackbarStore";

export default function ProScreen() {
  const router = useRouter();
  const storeLabel = Platform.OS === "android" ? "Google Play" : "App Store";
  const notices = [
    "アプリを削除しても支払い情報は残ります。",
    "契約期間は開始日から月額（月額プラン）または1年（年額プラン）ごとに自動更新されます。",
    `解約は ${storeLabel} のサブスクリプション設定から行います。`,
  ] as const;
  const queryClient = useQueryClient();
  const showSnackbar = useSnackbarStore((s) => s.show);
  const { enabled: proFeatures, isLoading: flagLoading } =
    useFeatureFlag("pro_features");
  // fullScreenModal で表示すると SafeAreaView の top inset が反映されないことがあるため、
  // useSafeAreaInsets で取得して直接 paddingTop に適用する。
  const insets = useSafeAreaInsets();
  // 既に使い切ったユーザーに「7日間無料」と誤案内しないため、CTAまわりの文言はここで出し分ける。
  // 判定確定前（isLoading）は DEFAULT_PRO_STATUS（has_used_trial: false）にフォールバックし
  // isTrialEligible が常に true になるため、確定するまではトライアル訴求を一切出さない。
  const { proStatus, isLoading: isProStatusLoading } = useProStatus();
  const isTrialEligible =
    !isProStatusLoading && !proStatus.subscription.has_used_trial;

  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [loadingOfferings, setLoadingOfferings] = useState(true);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(
    null,
  );
  // 多重起動の判定は、レンダーを跨がず同期的に読める ref で行う。課金・復元は
  // 非冪等な操作のため、state の反映タイミングに依存させない。UI 表示用の state は
  // ref と常に同時更新するので、呼び出し側は従来どおり setPurchasing / setRestoring を使う。
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
    if (!proFeatures) return;
    let cancelled = false;
    void (async () => {
      try {
        const result = await getOfferings();
        if (cancelled) return;
        setOffering(result);
        const packages = result?.availablePackages ?? [];
        // 初期選択は月額。無い構成では表示順の先頭（年額→その他）にフォールバックする。
        const preferred =
          packages.find((pkg) => pkg.packageType === "MONTHLY") ??
          packages.find((pkg) => pkg.packageType === "ANNUAL") ??
          packages[0];
        setSelectedPackageId(preferred?.identifier ?? null);
      } catch (error: unknown) {
        // RevenueCat 側の商品未登録・App Store Connect 未反映などで取得失敗しても、
        // 画面自体は表示を続け、プラン欄のみ空状態表示にフォールバックする。
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
  }, [proFeatures]);

  // flag 取得中に false 倒しで redirect すると、Pro ユーザーが初回アクセスで /pro を開けない。
  if (flagLoading) {
    return (
      <View style={[styles.container, styles.centerFull]}>
        <ActivityIndicator size="large" color="#d08000" />
      </View>
    );
  }
  if (!proFeatures) return <Redirect href="/" />;

  const packages = offering?.availablePackages ?? [];
  // RevenueCat が返す順序に依存せず、front と同じ「月額 → 年額」の順で表示する。
  const planDisplayRank = (packageType: string) => {
    if (packageType === "MONTHLY") return 0;
    if (packageType === "ANNUAL") return 1;
    return 2;
  };
  const displayPackages = [...packages].sort(
    (a, b) => planDisplayRank(a.packageType) - planDisplayRank(b.packageType),
  );
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

  const handlePurchase = async () => {
    // disabled プロパティだけに頼らず、連打による purchasePackage の多重起動を関数側でも防ぐ。
    if (!selectedPackage || purchasingRef.current) return;
    setPurchasing(true);
    try {
      await purchasePackage(selectedPackage);
    } catch (error: unknown) {
      setPurchasing(false);
      if (isUserCancelled(error)) return;
      const code = (error as { code?: PURCHASES_ERROR_CODE })?.code;
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
      Sentry.captureException(error, {
        tags: { source: "revenue_cat_purchase" },
      });
      showSnackbar({
        type: "error",
        message: "購入に失敗しました。時間を置いて再度お試しください",
      });
      return;
    }

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
    router.replace("/pro/success");
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
      router.back();
    } else {
      showSnackbar({
        type: "info",
        message: "復元できる購入情報がありませんでした",
      });
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.closeButton}
        accessibilityRole="button"
        accessibilityLabel="閉じる"
        hitSlop={8}
      >
        <Icon name="close" size={22} color="#F4F4F4" />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brandRow}>
          <Text style={styles.brandName}>BUZZ BASE</Text>
          <View style={styles.brandProBadge}>
            <Text style={styles.brandProBadgeText}>PRO</Text>
          </View>
        </View>
        <Text style={styles.subtitle}>すべての機能が使い放題になります</Text>

        <View style={styles.highlightCard}>
          <Text style={styles.highlightTitle}>{DEFAULT_COPY.title}</Text>
          <Text style={styles.highlightDescription}>
            {DEFAULT_COPY.description}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>PRO でできること</Text>
        <View style={styles.groupList}>
          {FEATURE_GROUPS.map((group) => (
            <View key={group.title} style={styles.group}>
              <View style={styles.groupHeader}>
                <Icon name={group.icon} size={16} color="#d08000" />
                <Text style={styles.groupHeaderTitle}>{group.title}</Text>
              </View>
              <View style={styles.table}>
                <View style={styles.tableHeaderRow}>
                  <View style={styles.tableLabelCell} />
                  <Text style={styles.tableHeaderFree}>無料</Text>
                  <Text style={styles.tableHeaderPro}>PRO</Text>
                </View>
                {group.keys.map((key, index) => (
                  <View
                    key={key}
                    style={[
                      styles.tableRow,
                      index === group.keys.length - 1 && styles.tableRowLast,
                    ]}
                    accessibilityLabel={`${PRO_PAYWALL_COPY[key].title}。無料は${FEATURE_COMPARISONS[key].free}、PROは${FEATURE_COMPARISONS[key].pro}`}
                  >
                    <Text style={styles.tableLabelCell} numberOfLines={2}>
                      {PRO_PAYWALL_COPY[key].title}
                    </Text>
                    <Text style={styles.tableFreeCell}>
                      {FEATURE_COMPARISONS[key].free}
                    </Text>
                    <Text style={styles.tableProCell}>
                      {FEATURE_COMPARISONS[key].pro}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>プランを選択</Text>
        {loadingOfferings ? (
          <ActivityIndicator
            size="small"
            color="#d08000"
            style={styles.plansLoading}
          />
        ) : packages.length > 0 ? (
          <View style={styles.planList}>
            {displayPackages.map((pkg) => {
              const label = PLAN_LABELS[pkg.packageType] ?? {
                name: pkg.product.title,
                period: "",
              };
              const isSelected = pkg.identifier === selectedPackageId;
              const showSavingsBadge =
                pkg.packageType === "ANNUAL" && annualIsDiscounted;
              return (
                <TouchableOpacity
                  key={pkg.identifier}
                  style={[
                    styles.planCard,
                    isSelected && styles.planCardSelected,
                  ]}
                  onPress={() => setSelectedPackageId(pkg.identifier)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={`${label.name} ${pkg.product.priceString}`}
                >
                  <View style={styles.planRadioOuter}>
                    {isSelected && <View style={styles.planRadioInner} />}
                  </View>
                  <View style={styles.planNameRow}>
                    <Text style={styles.planName}>{label.name}</Text>
                    {showSavingsBadge && annualSavingsAmount != null ? (
                      <View style={styles.savingsBadge}>
                        <Text style={styles.savingsBadgeText}>
                          年間¥{annualSavingsAmount.toLocaleString()}お得
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={styles.planPrice}>
                    {pkg.product.priceString}
                    {label.period}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <Text style={styles.emptyText}>
            プラン情報を取得できませんでした。時間を置いて再度お試しください。
          </Text>
        )}

        <TouchableOpacity
          onPress={handleRestore}
          disabled={restoring}
          style={styles.restoreLink}
          accessibilityRole="button"
          accessibilityLabel="購入を復元"
        >
          <Text style={styles.restoreLinkText}>
            {restoring ? "復元中..." : "購入を復元"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>注意事項</Text>
        <View style={styles.noticeList}>
          {notices.map((notice) => (
            <Text key={notice} style={styles.noticeText}>
              ・{notice}
            </Text>
          ))}
        </View>

        <Text style={styles.disclaimer}>
          {`契約期間は開始日から月額・年額などプランの周期ごとに自動更新されます。解約は ${storeLabel} のサブスクリプション設定から行えます。`}
        </Text>
      </ScrollView>

      <View
        style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 24) }]}
      >
        {isTrialEligible ? (
          <Text style={styles.trialNotice}>
            7 日間の無料トライアル期間中に解約すれば料金はかかりません
          </Text>
        ) : null}
        <TouchableOpacity
          onPress={handlePurchase}
          disabled={!selectedPackage || purchasing}
          style={[
            styles.ctaButton,
            (!selectedPackage || purchasing) && styles.ctaButtonDisabled,
          ]}
          accessibilityRole="button"
          accessibilityLabel={
            isProStatusLoading
              ? "PROを始める"
              : isTrialEligible
                ? "7日間無料で試す"
                : "Proに加入する"
          }
        >
          {purchasing ? (
            <ActivityIndicator size="small" color="#F4F4F4" />
          ) : (
            <Text style={styles.ctaButtonText}>
              {isProStatusLoading
                ? "PROを始める"
                : isTrialEligible
                  ? "7日間無料で試す"
                  : "Proに加入する"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2E2E2E",
  },
  centerFull: {
    alignItems: "center",
    justifyContent: "center",
  },
  closeButton: {
    alignSelf: "flex-end",
    padding: 12,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    alignItems: "center",
  },
  brandRow: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  brandName: {
    color: "#F4F4F4",
    fontSize: 27,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  brandProBadge: {
    backgroundColor: "#d08000",
    borderRadius: 7,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  brandProBadgeText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  subtitle: {
    alignSelf: "flex-start",
    color: "#A1A1AA",
    fontSize: 13,
    marginTop: 4,
    marginBottom: 20,
  },
  highlightCard: {
    width: "100%",
    backgroundColor: "rgba(208, 128, 0, 0.12)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(208, 128, 0, 0.4)",
    padding: 16,
    marginBottom: 20,
  },
  highlightTitle: {
    color: "#F4F4F4",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 6,
  },
  highlightDescription: {
    color: "#D4D4D4",
    fontSize: 13,
    lineHeight: 20,
  },
  sectionTitle: {
    alignSelf: "flex-start",
    color: "#A1A1AA",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 4,
  },
  groupList: {
    width: "100%",
    gap: 16,
    marginBottom: 20,
  },
  group: {
    width: "100%",
  },
  groupHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  groupHeaderTitle: {
    color: "#F4F4F4",
    fontSize: 13,
    fontWeight: "700",
  },
  table: {
    width: "100%",
    backgroundColor: "#3A3A3A",
    borderRadius: 12,
    overflow: "hidden",
  },
  tableHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#4A4A4A",
  },
  tableHeaderFree: {
    flex: 0.65,
    textAlign: "center",
    color: "#A1A1AA",
    fontSize: 11,
    fontWeight: "700",
  },
  tableHeaderPro: {
    flex: 0.75,
    textAlign: "center",
    color: "#d08000",
    fontSize: 11,
    fontWeight: "700",
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  tableLabelCell: {
    flex: 1.6,
    color: "#D4D4D4",
    fontSize: 13,
    paddingRight: 6,
  },
  tableFreeCell: {
    flex: 0.65,
    textAlign: "center",
    color: "#A1A1AA",
    fontSize: 13,
  },
  tableProCell: {
    flex: 0.75,
    textAlign: "center",
    color: "#d08000",
    fontSize: 13.5,
    fontWeight: "700",
  },
  plansLoading: {
    marginBottom: 20,
  },
  planList: {
    width: "100%",
    gap: 10,
    marginBottom: 16,
  },
  planCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#424242",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "transparent",
    padding: 14,
  },
  planCardSelected: {
    borderColor: "#d08000",
    backgroundColor: "rgba(208, 128, 0, 0.1)",
  },
  planRadioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#d08000",
    alignItems: "center",
    justifyContent: "center",
  },
  planRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#d08000",
  },
  planNameRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  planName: {
    color: "#F4F4F4",
    fontSize: 15,
    fontWeight: "700",
  },
  savingsBadge: {
    backgroundColor: "#d08000",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  savingsBadgeText: {
    color: "#F4F4F4",
    fontSize: 13,
    fontWeight: "700",
  },
  planPrice: {
    color: "#F4F4F4",
    fontSize: 16,
    fontWeight: "800",
    marginLeft: 8,
  },
  emptyText: {
    color: "#A1A1AA",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 16,
  },
  restoreLink: {
    paddingVertical: 8,
    marginBottom: 8,
  },
  restoreLinkText: {
    color: "#d08000",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  noticeList: {
    width: "100%",
    gap: 6,
    marginBottom: 16,
  },
  noticeText: {
    color: "#A1A1AA",
    fontSize: 12,
    lineHeight: 18,
  },
  disclaimer: {
    color: "#7A7A7A",
    fontSize: 11,
    lineHeight: 16,
    textAlign: "center",
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#424242",
  },
  trialNotice: {
    color: "#A1A1AA",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 8,
  },
  ctaButton: {
    backgroundColor: "#d08000",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaButtonDisabled: {
    opacity: 0.5,
  },
  ctaButtonText: {
    color: "#F4F4F4",
    fontSize: 15,
    fontWeight: "700",
  },
});

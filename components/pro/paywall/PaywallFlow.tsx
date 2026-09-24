import type { usePaywallPurchase } from "./usePaywallPurchase";
import type { PaywallStep } from "./usePaywallSteps";
import type { Feature } from "../../../types/pro";
import type { ProTrigger } from "@utils/analytics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Icon } from "@components/icon/Icon";
import { useMySeasons } from "@hooks/useSeasons";
import { trackPaywallPlanSelected } from "@utils/analytics";
import {
  DEFAULT_COPY,
  FEATURE_COMPARISONS,
  filterFeatureGroups,
  FEATURE_GROUPS,
  monthlyEquivalent,
  PAYWALL_FAQ,
  PLAN_LABELS,
  PRO_PAYWALL_COPY,
  STORE_LABEL,
  toPlanType,
  valueBlocksFor,
} from "./paywallContent";
import { PaywallSlides } from "./PaywallSlides";

// 単年の記録しか無いユーザーにシーズン跨ぎ比較を訴求しても空のグラフしか見せられないため、
// 文言を「来シーズンから使える」に差し替えて、いま効果が出る分析へ誘導する。
const SINGLE_SEASON_NOTE =
  "いまはまだ1シーズン分の記録のため比較グラフは作れません。来シーズンの記録が増えると、シーズンを跨いだ成長をそのまま比較できます。";

interface PaywallFlowProps {
  feature?: Feature;
  contextMessage?: string;
  trigger: ProTrigger;
  step: PaywallStep;
  goToPlan: () => void;
  purchase: ReturnType<typeof usePaywallPurchase>;
  /** トライアル権利があるか。判定確定前は false を渡してトライアル訴求を出さない。 */
  isTrialEligible: boolean;
  /** Pro 状態の判定確定前。CTA 文言を中立にする。 */
  isProStatusLoading: boolean;
  /** 規約などへ遷移する前に Paywall を閉じる処理。 */
  onNavigateAway: () => void;
  bottomInset?: number;
}

/**
 * Paywall の本体。価値画面（value）とプラン画面（plan）を切り替えて描画し、
 * 画面下部に常時固定の CTA を置く。モーダル・全画面のどちらの外枠からも利用する。
 */
export function PaywallFlow({
  feature,
  contextMessage,
  trigger,
  step,
  goToPlan,
  purchase,
  isTrialEligible,
  isProStatusLoading,
  onNavigateAway,
  bottomInset = 24,
}: PaywallFlowProps) {
  const router = useRouter();
  const [allFeaturesOpen, setAllFeaturesOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const { seasons } = useMySeasons();
  const isSingleSeason =
    trigger === "season_transition_graph" && seasons.length < 2;

  const copy = feature
    ? ((PRO_PAYWALL_COPY as Record<string, typeof DEFAULT_COPY>)[feature] ??
      DEFAULT_COPY)
    : DEFAULT_COPY;
  const valueBlocks = isSingleSeason
    ? valueBlocksFor("hit_direction_average")
    : valueBlocksFor(trigger);
  const visibleGroups = filterFeatureGroups(FEATURE_GROUPS, feature);

  const ctaLabel = isProStatusLoading
    ? "PROを始める"
    : isTrialEligible
      ? "7日間無料で試す"
      : "Proに加入する";
  const planCtaLabel = isProStatusLoading
    ? "このプランで続ける"
    : isTrialEligible
      ? "このプランで7日間無料で試す"
      : "このプランでProに加入する";

  const goToLegal = (path: string) => {
    onNavigateAway();
    router.push(path);
  };

  const renderValueStep = () => (
    <>
      <View style={styles.brandRow}>
        <Text style={styles.brandName}>BUZZ BASE</Text>
        <View style={styles.brandProBadge}>
          <Text style={styles.brandProBadgeText}>PRO</Text>
        </View>
      </View>

      {/* 単年ユーザーにはシーズン跨ぎの図が作れないため、代わりにいま効果が出る方向別を先頭にする。 */}
      <PaywallSlides
        trigger={trigger}
        leadSlide={isSingleSeason ? "hit_direction" : undefined}
      />

      {contextMessage ? (
        <View style={styles.contextBanner}>
          <Icon name="information-circle" size={16} color="#D4D4D4" />
          <Text style={styles.contextBannerText}>{contextMessage}</Text>
        </View>
      ) : null}

      <Text style={styles.heroTitle}>{copy.title}</Text>

      {isSingleSeason ? (
        <Text style={styles.heroDescription}>{SINGLE_SEASON_NOTE}</Text>
      ) : copy.benefits?.length ? (
        <Text style={styles.heroDescription}>
          {copy.benefits.map((benefit) => `・${benefit}`).join("\n")}
        </Text>
      ) : (
        <Text style={styles.heroDescription}>{copy.description}</Text>
      )}

      <Text style={styles.sectionTitle}>Pro でできること</Text>
      <View style={styles.valueBlockList}>
        {valueBlocks.map((key) => (
          <View key={key} style={styles.valueBlock}>
            <View style={styles.valueBlockIcon}>
              <Icon name="checkmark-circle" size={18} color="#d08000" />
            </View>
            <View style={styles.valueBlockBody}>
              <Text style={styles.valueBlockTitle}>
                {PRO_PAYWALL_COPY[key].title}
              </Text>
              <Text style={styles.valueBlockDescription}>
                {PRO_PAYWALL_COPY[key].description}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.disclosureRow}
        onPress={() => setAllFeaturesOpen((open) => !open)}
        accessibilityRole="button"
        accessibilityState={{ expanded: allFeaturesOpen }}
        accessibilityLabel="Pro の全機能を見る"
      >
        <Text style={styles.disclosureLabel}>Pro の全機能を見る</Text>
        <Icon
          name={allFeaturesOpen ? "chevron-up" : "chevron-down"}
          size={18}
          color="#A1A1AA"
        />
      </TouchableOpacity>

      {allFeaturesOpen ? (
        <View style={styles.groupList}>
          {visibleGroups.map((group) => (
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
      ) : null}

      <Text style={styles.sectionTitle}>よくある質問</Text>
      <View style={styles.faqList}>
        {PAYWALL_FAQ.map((item, index) => {
          const isOpen = openFaqIndex === index;
          return (
            <View key={item.question} style={styles.faqItem}>
              <TouchableOpacity
                style={styles.faqQuestionRow}
                onPress={() => setOpenFaqIndex(isOpen ? null : index)}
                accessibilityRole="button"
                accessibilityState={{ expanded: isOpen }}
                accessibilityLabel={item.question}
              >
                <Text style={styles.faqQuestion}>{item.question}</Text>
                <Icon
                  name={isOpen ? "chevron-up" : "chevron-down"}
                  size={16}
                  color="#A1A1AA"
                />
              </TouchableOpacity>
              {isOpen ? (
                <Text style={styles.faqAnswer}>{item.answer}</Text>
              ) : null}
            </View>
          );
        })}
      </View>
    </>
  );

  const renderPlanStep = () => (
    <>
      <Text style={styles.planHeading}>プランを選ぶ</Text>
      {purchase.loadingOfferings ? (
        <ActivityIndicator
          size="small"
          color="#d08000"
          style={styles.plansLoading}
        />
      ) : purchase.packages.length > 0 ? (
        <View style={styles.planRow}>
          {purchase.packages.map((pkg) => {
            const label = PLAN_LABELS[pkg.packageType] ?? {
              name: pkg.product.title,
              period: "",
            };
            const isSelected = pkg.identifier === purchase.selectedPackageId;
            const perMonth = monthlyEquivalent(
              pkg.packageType,
              pkg.product.price,
            );
            const showSavingsBadge =
              pkg.packageType === "ANNUAL" && purchase.annualIsDiscounted;
            return (
              <TouchableOpacity
                key={pkg.identifier}
                style={[styles.planCard, isSelected && styles.planCardSelected]}
                onPress={() => {
                  purchase.setSelectedPackageId(pkg.identifier);
                  trackPaywallPlanSelected({
                    plan_type: toPlanType(pkg.packageType),
                    trigger,
                  });
                }}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={`${label.name} ${pkg.product.priceString}`}
              >
                {showSavingsBadge && purchase.annualSavingsAmount != null ? (
                  <View style={styles.savingsBadge}>
                    <Text style={styles.savingsBadgeText}>
                      年間¥{purchase.annualSavingsAmount.toLocaleString()}お得
                    </Text>
                  </View>
                ) : null}
                <Text style={styles.planName}>{label.name}</Text>
                <Text style={styles.planPrice}>
                  {pkg.product.priceString}
                  {label.period}
                </Text>
                {perMonth != null ? (
                  <Text style={styles.planPerMonth}>
                    月あたり ¥{perMonth.toLocaleString()}
                  </Text>
                ) : null}
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
        onPress={purchase.handleRestore}
        disabled={purchase.restoring}
        style={styles.restoreLink}
        accessibilityRole="button"
        accessibilityLabel="購入を復元"
      >
        <Text style={styles.restoreLinkText}>
          {purchase.restoring ? "復元中..." : "購入を復元"}
        </Text>
      </TouchableOpacity>

      <Text style={styles.disclaimer}>
        {`契約期間は開始日から月額・年額などプランの周期ごとに自動更新されます。解約は ${STORE_LABEL} のサブスクリプション設定から行えます。`}
      </Text>

      <View style={styles.legalLinksRow}>
        <TouchableOpacity
          onPress={() => goToLegal("/terms-of-service")}
          accessibilityRole="link"
          accessibilityLabel="利用規約"
        >
          <Text style={styles.legalLinkText}>利用規約</Text>
        </TouchableOpacity>
        <Text style={styles.legalLinkSeparator}>・</Text>
        <TouchableOpacity
          onPress={() => goToLegal("/privacy-policy")}
          accessibilityRole="link"
          accessibilityLabel="プライバシーポリシー"
        >
          <Text style={styles.legalLinkText}>プライバシーポリシー</Text>
        </TouchableOpacity>
        <Text style={styles.legalLinkSeparator}>・</Text>
        <TouchableOpacity
          onPress={() => goToLegal("/tokushoho")}
          accessibilityRole="link"
          accessibilityLabel="特定商取引法に基づく表記"
        >
          <Text style={styles.legalLinkText}>特定商取引法に基づく表記</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const isPlanStep = step === "plan";

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isPlanStep ? renderPlanStep() : renderValueStep()}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: bottomInset }]}>
        {isTrialEligible ? (
          <Text style={styles.trialNotice}>
            7 日間の無料トライアル期間中に解約すれば料金はかかりません
          </Text>
        ) : null}
        {isPlanStep ? (
          <TouchableOpacity
            onPress={purchase.handlePurchase}
            disabled={!purchase.selectedPackage || purchase.purchasing}
            style={[
              styles.ctaButton,
              (!purchase.selectedPackage || purchase.purchasing) &&
                styles.ctaButtonDisabled,
            ]}
            accessibilityRole="button"
            accessibilityLabel={planCtaLabel}
          >
            {purchase.purchasing ? (
              <ActivityIndicator size="small" color="#F4F4F4" />
            ) : (
              <Text style={styles.ctaButtonText}>{planCtaLabel}</Text>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={goToPlan}
            style={styles.ctaButton}
            accessibilityRole="button"
            accessibilityLabel={ctaLabel}
          >
            <Text style={styles.ctaButtonText}>{ctaLabel}</Text>
          </TouchableOpacity>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    alignItems: "center",
  },
  brandRow: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
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
  contextBanner: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#3A3A3A",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  contextBannerText: {
    flex: 1,
    color: "#D4D4D4",
    fontSize: 13,
    lineHeight: 18,
  },
  heroTitle: {
    alignSelf: "flex-start",
    color: "#F4F4F4",
    fontSize: 21,
    fontWeight: "800",
    lineHeight: 30,
    marginBottom: 4,
  },
  heroDescription: {
    alignSelf: "flex-start",
    color: "#D4D4D4",
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 24,
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
  valueBlockList: {
    width: "100%",
    gap: 12,
    marginBottom: 20,
  },
  valueBlock: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#3A3A3A",
    borderRadius: 12,
    padding: 14,
  },
  valueBlockIcon: {
    paddingTop: 1,
  },
  valueBlockBody: {
    flex: 1,
    gap: 4,
  },
  valueBlockTitle: {
    color: "#F4F4F4",
    fontSize: 15,
    fontWeight: "700",
  },
  valueBlockDescription: {
    color: "#D4D4D4",
    fontSize: 13,
    lineHeight: 20,
  },
  disclosureRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#424242",
    marginBottom: 20,
  },
  disclosureLabel: {
    color: "#F4F4F4",
    fontSize: 14,
    fontWeight: "600",
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
  faqList: {
    width: "100%",
    backgroundColor: "#3A3A3A",
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#4A4A4A",
    paddingVertical: 4,
  },
  faqQuestionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    paddingVertical: 12,
  },
  faqQuestion: {
    flex: 1,
    color: "#F4F4F4",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
  faqAnswer: {
    color: "#D4D4D4",
    fontSize: 13,
    lineHeight: 20,
    paddingBottom: 12,
  },
  planHeading: {
    alignSelf: "flex-start",
    color: "#F4F4F4",
    fontSize: 21,
    fontWeight: "800",
    marginBottom: 16,
  },
  plansLoading: {
    marginBottom: 20,
  },
  planRow: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  planCard: {
    flexGrow: 1,
    flexBasis: 0,
    minWidth: 140,
    alignItems: "center",
    gap: 4,
    backgroundColor: "#424242",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "transparent",
    paddingVertical: 18,
    paddingHorizontal: 12,
  },
  planCardSelected: {
    borderColor: "#d08000",
    backgroundColor: "rgba(208, 128, 0, 0.1)",
  },
  planName: {
    color: "#F4F4F4",
    fontSize: 14,
    fontWeight: "700",
  },
  planPrice: {
    color: "#F4F4F4",
    fontSize: 20,
    fontWeight: "800",
  },
  planPerMonth: {
    color: "#A1A1AA",
    fontSize: 12,
  },
  savingsBadge: {
    backgroundColor: "#d08000",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    marginBottom: 2,
  },
  savingsBadgeText: {
    color: "#F4F4F4",
    fontSize: 12,
    fontWeight: "700",
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
  disclaimer: {
    color: "#7A7A7A",
    fontSize: 11,
    lineHeight: 16,
    textAlign: "center",
  },
  legalLinksRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 4,
    marginTop: 8,
  },
  legalLinkText: {
    color: "#d08000",
    fontSize: 11,
    textDecorationLine: "underline",
  },
  legalLinkSeparator: {
    color: "#7A7A7A",
    fontSize: 11,
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

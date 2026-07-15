import type { Feature, ProFeature } from "../../types/pro";
import type {
  PACKAGE_TYPE,
  PurchasesOffering,
} from "react-native-purchases";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFeatureFlag } from "@hooks/useFeatureFlag";
import { syncProStatus } from "@services/proService";
import {
  getOfferings,
  purchasePackage,
  restorePurchases,
} from "@services/revenueCatService";
import { useSnackbarStore } from "@stores/snackbarStore";
import { PRO_FEATURES } from "../../types/pro";

interface PaywallCopy {
  title: string;
  description: string;
}

// Pro 機能ごとの paywall コピー。各機能 Issue で文言を最終調整する想定。
const PRO_PAYWALL_COPY: Record<ProFeature, PaywallCopy> = {
  no_ads: {
    title: "広告を非表示にして集中する",
    description:
      "Pro プランに加入すると、アプリ内のすべての広告が非表示になります。",
  },
  season_transition_graph: {
    title: "シーズンを跨いだ成長を可視化",
    description:
      "過去複数シーズンの成績を折れ線グラフで比較して、長期的な成長を確認できます。",
  },
  grass_full_history: {
    title: "練習履歴を全期間で確認",
    description:
      "草機能のヒートマップを全期間で表示。継続の積み重ねを実感できます。",
  },
  unlimited_practice_menus: {
    title: "練習メニューを無制限に登録",
    description:
      "Pro プランなら4つ目以降の練習メニューも自由に登録・編集できます。",
  },
  unlimited_media_uploads: {
    title: "動画・画像を無制限にアップロード",
    description: "月3点までの制限を撤廃。練習映像をいくらでも保存できます。",
  },
  media_long_term_storage: {
    title: "動画・画像を長期保管",
    description: "31日以上前にアップロードしたメディアもいつでも閲覧可能です。",
  },
  schedule_copy_next_week: {
    title: "今週のプランを来週にまるごとコピー",
    description:
      "Pro プランなら今週登録した予定をワンタップで来週にコピーでき、プラン作りの手間を省けます。",
  },
  unlimited_menu_sets: {
    title: "メニューセットを無制限に作成",
    description:
      "よく組む練習をセットにして、予定登録や週プランでそのまま使い回せます。",
  },
  unlimited_monthly_goals: {
    title: "月次目標を複数管理",
    description: "打撃・投手・走塁など複数の目標を同時に追跡できます。",
  },
  season_goals: {
    title: "シーズン目標を設定",
    description:
      "1シーズンを通した中長期目標を設定し、月次目標と紐づけて追跡できます。",
  },
  tournament_goals: {
    title: "大会目標を設定",
    description:
      "特定の大会に向けた目標を設定し、その大会の成績で達成を追跡できます。",
  },
  custom_notification_messages: {
    title: "通知メッセージをカスタマイズ",
    description: "練習リマインドや目標達成通知の文言を自分好みに編集できます。",
  },
  advanced_goal_tracking: {
    title: "目標達成度を詳細に追跡",
    description:
      "達成率の推移グラフや改善ポイントの提示で、目標到達を後押しします。",
  },
  detailed_condition_log: {
    title: "コンディションを詳しく記録",
    description:
      "体調・気分・睡眠などを細かく記録し、調子の良し悪しの傾向を把握できます。",
  },
  unlimited_improvement_themes: {
    title: "取り組む課題を無制限に",
    description:
      "複数の課題を同時に設定して、練習やノートをそれぞれの課題に束ねられます。",
  },
  correlation_insights: {
    title: "練習と成績の関係を発見",
    description:
      "素振りや睡眠と打率の傾向を、あなたのデータから自動で読み解きます。",
  },
  unlimited_reflection_templates: {
    title: "振り返りテンプレを自由に作成",
    description:
      "自分専用の問いかけテンプレをいくつでも作って、振り返りの質を高められます。",
  },
  advanced_periodic_review: {
    title: "週次・月次レポートを詳しく",
    description:
      "課題別の取り組みや成績の推移、練習と成績のつながりを含む詳細レポートを受け取れます。",
  },
  note_tags: {
    title: "野球ノートにタグを付けて整理",
    description:
      "Pro プランなら野球ノートにタグを付けて、後から振り返りやすく整理できます。",
  },
  multi_game_result_notes: {
    title: "1つのノートに複数の試合を紐付け",
    description:
      "Pro プランなら1つの野球ノートに複数の試合記録を紐付けて振り返れます。",
  },
  multi_improvement_theme_links: {
    title: "1つの記録に複数の課題を紐付け",
    description:
      "Pro プランなら練習記録・野球ノートに複数の課題を同時に紐付けて、取り組みをまとめて振り返れます。",
  },
};

const DEFAULT_COPY: PaywallCopy = {
  title: "Pro 加入で BUZZ BASE をフル活用",
  description: "Pro プランで全機能のロックを解除できます。",
};

// RevenueCat の packageType は Offering 設定に依存するため、未知の値は product.title にフォールバックする。
const PLAN_LABELS: Partial<
  Record<PACKAGE_TYPE, { name: string; period: string }>
> = {
  MONTHLY: { name: "月額プラン", period: "/月" },
  ANNUAL: { name: "年額プラン", period: "/年" },
  SIX_MONTH: { name: "半年プラン", period: "/6ヶ月" },
  THREE_MONTH: { name: "3ヶ月プラン", period: "/3ヶ月" },
  TWO_MONTH: { name: "2ヶ月プラン", period: "/2ヶ月" },
  WEEKLY: { name: "週額プラン", period: "/週" },
  LIFETIME: { name: "買い切りプラン", period: "" },
};

const isUserCancelled = (error: unknown): boolean =>
  typeof error === "object" &&
  error !== null &&
  (error as { userCancelled?: boolean }).userCancelled === true;

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: Feature;
}

/**
 * Pro 機能への加入を促す下からせり出すシート型モーダル。
 * feature に対応する訴求コピーを先頭に強調表示し、他の Pro 機能一覧・実際のプラン購入・
 * 購入の復元までをこのシート単体で完結させる。無料機能を誤って渡された場合は汎用コピーで表示する。
 */
export function PaywallModal({ isOpen, onClose, feature }: PaywallModalProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const showSnackbar = useSnackbarStore((s) => s.show);
  const { enabled: proFeaturesFlag } = useFeatureFlag("pro_features");
  const copy =
    (PRO_PAYWALL_COPY as Record<string, PaywallCopy>)[feature] ?? DEFAULT_COPY;

  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [loadingOfferings, setLoadingOfferings] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(
    null,
  );
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setLoadingOfferings(true);
    void (async () => {
      try {
        const result = await getOfferings();
        if (cancelled) return;
        setOffering(result);
        const packages = result?.availablePackages ?? [];
        // 年額があれば「お得」導線として初期選択にする。無ければ最初のプランを選ぶ。
        const preferred =
          packages.find((pkg) => pkg.packageType === "ANNUAL") ?? packages[0];
        setSelectedPackageId(preferred?.identifier ?? null);
      } finally {
        if (!cancelled) setLoadingOfferings(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  // Pro リリース前 / kill switch off では加入導線を完全に隠す。
  if (!proFeaturesFlag) return null;

  const packages = offering?.availablePackages ?? [];
  const selectedPackage =
    packages.find((pkg) => pkg.identifier === selectedPackageId) ?? null;
  const monthlyPackage = packages.find((pkg) => pkg.packageType === "MONTHLY");
  const annualPackage = packages.find((pkg) => pkg.packageType === "ANNUAL");
  const annualIsDiscounted =
    !!monthlyPackage &&
    !!annualPackage &&
    annualPackage.product.price < monthlyPackage.product.price * 12;

  const otherFeatures = PRO_FEATURES.filter((key) => key !== feature);

  const handlePurchase = async () => {
    if (!selectedPackage) return;
    setPurchasing(true);
    try {
      await purchasePackage(selectedPackage);
      await syncProStatus();
      await queryClient.invalidateQueries({ queryKey: ["pro", "status"] });
      onClose();
      router.push("/pro/success");
    } catch (error: unknown) {
      if (isUserCancelled(error)) return;
      showSnackbar({
        type: "error",
        message: "購入に失敗しました。時間を置いて再度お試しください",
      });
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    try {
      await restorePurchases();
      await syncProStatus();
      await queryClient.invalidateQueries({ queryKey: ["pro", "status"] });
      showSnackbar({ type: "success", message: "購入情報を復元しました" });
      onClose();
    } catch {
      showSnackbar({
        type: "error",
        message: "復元に失敗しました。時間を置いて再度お試しください",
      });
    } finally {
      setRestoring(false);
    }
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityLabel="ペイウォールを閉じる"
        />
        <View style={styles.sheet} accessibilityViewIsModal>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            accessibilityRole="button"
            accessibilityLabel="閉じる"
            hitSlop={8}
          >
            <Ionicons name="close" size={22} color="#F4F4F4" />
          </TouchableOpacity>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.badge}>
              <Ionicons name="star" size={18} color="#d08000" />
            </View>
            <Text style={styles.title}>PRO にアップグレード</Text>
            <Text style={styles.subtitle}>すべての機能をアンロック</Text>

            <View style={styles.highlightCard}>
              <Text style={styles.highlightTitle}>{copy.title}</Text>
              <Text style={styles.highlightDescription}>
                {copy.description}
              </Text>
            </View>

            <Text style={styles.sectionTitle}>PRO でできること</Text>
            <View style={styles.featureList}>
              {otherFeatures.map((key) => (
                <View key={key} style={styles.featureRow}>
                  <Ionicons name="lock-closed" size={14} color="#d08000" />
                  <Text style={styles.featureLabel} numberOfLines={1}>
                    {PRO_PAYWALL_COPY[key].title}
                  </Text>
                  <View style={styles.proBadge}>
                    <Text style={styles.proBadgeText}>PRO</Text>
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
                {packages.map((pkg) => {
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
                      <View style={styles.planInfo}>
                        <View style={styles.planNameRow}>
                          <Text style={styles.planName}>{label.name}</Text>
                          {showSavingsBadge ? (
                            <View style={styles.savingsBadge}>
                              <Text style={styles.savingsBadgeText}>お得</Text>
                            </View>
                          ) : null}
                        </View>
                        <Text style={styles.planPrice}>
                          {pkg.product.priceString}
                          {label.period}
                        </Text>
                      </View>
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

            <Text style={styles.disclaimer}>
              契約期間は開始日から月額・年額などプランの周期ごとに自動更新されます。解約は
              App Store / Google Play のサブスクリプション設定から行えます。
            </Text>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              onPress={handlePurchase}
              disabled={!selectedPackage || purchasing}
              style={[
                styles.ctaButton,
                (!selectedPackage || purchasing) && styles.ctaButtonDisabled,
              ]}
              accessibilityRole="button"
              accessibilityLabel="PROを始める"
            >
              {purchasing ? (
                <ActivityIndicator size="small" color="#F4F4F4" />
              ) : (
                <Text style={styles.ctaButtonText}>PROを始める</Text>
              )}
            </TouchableOpacity>
          </View>
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    alignItems: "center",
  },
  badge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(208, 128, 0, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  title: {
    color: "#F4F4F4",
    fontSize: 20,
    fontWeight: "700",
  },
  subtitle: {
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
  featureList: {
    width: "100%",
    gap: 10,
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  featureLabel: {
    flex: 1,
    color: "#F4F4F4",
    fontSize: 13,
  },
  proBadge: {
    backgroundColor: "rgba(208, 128, 0, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  proBadgeText: {
    color: "#d08000",
    fontSize: 10,
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
  planInfo: {
    flex: 1,
  },
  planNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },
  planName: {
    color: "#F4F4F4",
    fontSize: 14,
    fontWeight: "700",
  },
  savingsBadge: {
    backgroundColor: "#d08000",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 999,
  },
  savingsBadgeText: {
    color: "#F4F4F4",
    fontSize: 10,
    fontWeight: "700",
  },
  planPrice: {
    color: "#A1A1AA",
    fontSize: 12,
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
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: "#424242",
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

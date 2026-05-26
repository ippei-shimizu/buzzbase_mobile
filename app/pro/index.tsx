import type {
  PurchasesOffering,
  PurchasesPackage,
} from "react-native-purchases";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { Redirect, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFeatureFlag } from "@hooks/useFeatureFlag";
import { syncProStatus } from "@services/proService";
import { getOfferings, purchasePackage } from "@services/revenueCatService";
import { useSnackbarStore } from "@stores/snackbarStore";

const FEATURE_HIGHLIGHTS = [
  "広告非表示",
  "シーズン跨ぎ成績推移グラフ",
  "草機能の全期間ヒートマップ",
  "動画・画像アップロード無制限",
  "メディア長期保管",
  "練習メニュー / 自主練スケジュール無制限",
  "月次目標・シーズン目標無制限",
  "カスタム通知メッセージ",
] as const;

const NOTICES = [
  "7 日間の無料トライアル期間中に解約すれば料金はかかりません。",
  "アプリを削除しても支払い情報は残ります。",
  "契約期間は開始日から月額（月額プラン）または1年（年額プラン）ごとに自動更新されます。",
  "解約は App Store のサブスクリプション設定から行います。",
] as const;

const isUserCancelled = (error: unknown): boolean =>
  typeof error === "object" &&
  error !== null &&
  (error as { userCancelled?: boolean }).userCancelled === true;

export default function ProScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const showSnackbar = useSnackbarStore((s) => s.show);
  const proFeatures = useFeatureFlag("pro_features");
  // fullScreenModal で表示すると SafeAreaView の top inset が反映されないことがあるため、
  // useSafeAreaInsets で取得して直接 paddingTop に適用する。
  const insets = useSafeAreaInsets();

  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [loadingOfferings, setLoadingOfferings] = useState(true);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  useEffect(() => {
    if (!proFeatures) return;
    let cancelled = false;
    void (async () => {
      try {
        const result = await getOfferings();
        if (!cancelled) setOffering(result);
      } finally {
        if (!cancelled) setLoadingOfferings(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [proFeatures]);

  if (!proFeatures) return <Redirect href="/" />;

  const handlePurchase = async (pkg: PurchasesPackage) => {
    setPurchasingId(pkg.identifier);
    try {
      await purchasePackage(pkg);
      await syncProStatus();
      await queryClient.invalidateQueries({ queryKey: ["pro", "status"] });
      router.replace("/pro/success");
    } catch (error: unknown) {
      if (isUserCancelled(error)) return;
      showSnackbar({
        type: "error",
        message: "購入に失敗しました。時間を置いて再度お試しください",
      });
    } finally {
      setPurchasingId(null);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="閉じる"
          hitSlop={8}
        >
          <Ionicons name="close" size={28} color="#F4F4F4" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pro に加入</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heroBadge}>BUZZ BASE Pro</Text>
        <Text style={styles.heroTitle}>記録を、成長へ。</Text>
        <Text style={styles.heroDescription}>
          広告なし、メディア無制限、シーズン跨ぎグラフ。Pro
          で全機能を解放しよう。
        </Text>

        <View style={styles.featureList}>
          {FEATURE_HIGHLIGHTS.map((feature) => (
            <View key={feature} style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#d08000" />
              <Text style={styles.featureLabel}>{feature}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>プランを選ぶ</Text>
        {loadingOfferings ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#d08000" />
          </View>
        ) : offering && offering.availablePackages.length > 0 ? (
          offering.availablePackages.map((pkg) => (
            <TouchableOpacity
              key={pkg.identifier}
              style={styles.planCard}
              onPress={() => handlePurchase(pkg)}
              disabled={purchasingId !== null}
              accessibilityRole="button"
              accessibilityLabel={`${pkg.product.title} で加入`}
            >
              <View style={styles.planInfo}>
                <Text style={styles.planTitle}>{pkg.product.title}</Text>
                <Text style={styles.planDescription}>
                  {pkg.product.description}
                </Text>
              </View>
              <View style={styles.planPriceArea}>
                <Text style={styles.planPrice}>{pkg.product.priceString}</Text>
                {purchasingId === pkg.identifier ? (
                  <ActivityIndicator size="small" color="#d08000" />
                ) : null}
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.center}>
            <Text style={styles.emptyText}>
              プラン情報を取得できませんでした。時間を置いて再度お試しください。
            </Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>注意事項</Text>
        <View style={styles.noticeList}>
          {NOTICES.map((notice) => (
            <Text key={notice} style={styles.noticeText}>
              ・{notice}
            </Text>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2E2E2E",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomColor: "#424242",
    borderBottomWidth: 1,
  },
  headerTitle: {
    color: "#F4F4F4",
    fontSize: 16,
    fontWeight: "700",
  },
  headerSpacer: {
    width: 28,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    paddingBottom: 48,
  },
  heroBadge: {
    alignSelf: "flex-start",
    color: "#d08000",
    backgroundColor: "rgba(208, 128, 0, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 8,
    overflow: "hidden",
  },
  heroTitle: {
    color: "#F4F4F4",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
  },
  heroDescription: {
    color: "#D4D4D4",
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 24,
  },
  featureList: {
    gap: 10,
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  featureLabel: {
    color: "#F4F4F4",
    fontSize: 14,
  },
  sectionTitle: {
    color: "#A1A1AA",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 8,
  },
  planCard: {
    backgroundColor: "#424242",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  planInfo: {
    flex: 1,
    marginRight: 12,
  },
  planTitle: {
    color: "#F4F4F4",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 2,
  },
  planDescription: {
    color: "#A1A1AA",
    fontSize: 12,
    lineHeight: 16,
  },
  planPriceArea: {
    alignItems: "flex-end",
    gap: 4,
  },
  planPrice: {
    color: "#F4F4F4",
    fontSize: 15,
    fontWeight: "700",
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
  },
  emptyText: {
    color: "#A1A1AA",
    fontSize: 13,
    textAlign: "center",
  },
  noticeList: {
    gap: 6,
    marginBottom: 16,
  },
  noticeText: {
    color: "#A1A1AA",
    fontSize: 12,
    lineHeight: 18,
  },
});

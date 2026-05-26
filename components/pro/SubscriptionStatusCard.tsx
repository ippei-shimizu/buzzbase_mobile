import type { ProSubscription } from "../../types/pro";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface SubscriptionStatusCardProps {
  subscription: ProSubscription;
  /** trial / active の解約方法案内ボタンタップ時に呼ばれる。未指定なら非表示。 */
  onPressCancelGuide?: () => void;
}

interface StatusContent {
  label: string;
  description: string;
  badgeColor: string;
}

const PLAN_LABEL: Record<string, string> = {
  monthly: "月額プラン",
  yearly: "年額プラン",
};

const formatDate = (iso: string | null): string => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
};

const statusContent = (subscription: ProSubscription): StatusContent => {
  switch (subscription.status) {
    case "trial":
      return {
        label: "無料トライアル中",
        description: "期間中はいつでも解約できます。",
        badgeColor: "#3b82f6",
      };
    case "active":
      return {
        label: "Pro 加入中",
        description: "Pro 機能をすべてご利用いただけます。",
        badgeColor: "#10b981",
      };
    case "cancelled":
      return {
        label: "解約済み（期間内）",
        description: "次回更新日まで Pro 機能を利用できます。",
        badgeColor: "#f59e0b",
      };
    case "billing_issue":
      return {
        label: "決済に問題があります",
        description: "App Store の決済情報を更新してください。",
        badgeColor: "#ef4444",
      };
    case "expired":
      return {
        label: "Pro 期間終了",
        description: "再加入すると過去のデータも引き続き閲覧できます。",
        badgeColor: "#6b7280",
      };
    case "pending":
      return {
        label: "処理中",
        description: "決済処理が完了するまでお待ちください。",
        badgeColor: "#6b7280",
      };
    case "free":
    default:
      return {
        label: "無料プラン",
        description: "Pro に加入するとすべての機能を利用できます。",
        badgeColor: "#6b7280",
      };
  }
};

/**
 * Pro 加入状態を表示するカード。
 * status と pro_active / in_trial / in_grace_period の組み合わせで文言を出し分け、
 * 加入中（trial / active）のときだけ解約方法案内ボタンを表示する。
 */
export function SubscriptionStatusCard({
  subscription,
  onPressCancelGuide,
}: SubscriptionStatusCardProps) {
  const content = statusContent(subscription);
  const planLabel = subscription.plan_type
    ? PLAN_LABEL[subscription.plan_type]
    : null;
  const showCancelGuide =
    onPressCancelGuide !== undefined &&
    (subscription.status === "trial" || subscription.status === "active");

  return (
    <View style={styles.card} accessibilityLabel="サブスクリプション状態">
      <View style={styles.header}>
        <View
          style={[styles.badge, { backgroundColor: content.badgeColor }]}
          accessibilityLabel={content.label}
        >
          <Text style={styles.badgeText}>{content.label}</Text>
        </View>
        {planLabel ? <Text style={styles.planLabel}>{planLabel}</Text> : null}
      </View>

      <Text style={styles.description}>{content.description}</Text>

      <View style={styles.meta}>
        <Text style={styles.metaLabel}>次回更新 / 期限</Text>
        <Text style={styles.metaValue}>
          {formatDate(subscription.expires_at)}
        </Text>
      </View>

      {showCancelGuide ? (
        <TouchableOpacity
          onPress={onPressCancelGuide}
          style={styles.cancelGuide}
          accessibilityRole="button"
          accessibilityLabel="解約方法を見る"
        >
          <Text style={styles.cancelGuideText}>解約方法を見る</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#424242",
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: {
    color: "#F4F4F4",
    fontSize: 12,
    fontWeight: "700",
  },
  planLabel: {
    color: "#D4D4D4",
    fontSize: 13,
    fontWeight: "600",
  },
  description: {
    color: "#D4D4D4",
    fontSize: 14,
    lineHeight: 20,
  },
  meta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#525252",
  },
  metaLabel: {
    color: "#A1A1AA",
    fontSize: 12,
  },
  metaValue: {
    color: "#F4F4F4",
    fontSize: 13,
    fontWeight: "600",
  },
  cancelGuide: {
    marginTop: 8,
    alignSelf: "flex-start",
  },
  cancelGuideText: {
    color: "#d08000",
    fontSize: 13,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});

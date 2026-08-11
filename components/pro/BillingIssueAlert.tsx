import type { Platform, ProSubscription } from "../../types/pro";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface BillingIssueAlertProps {
  subscription: ProSubscription;
}

// 支払い方法を保持しているのは決済プロバイダ側なので、更新手続きの案内先は媒体で変わる。
// platform 未確定（null）は加入直後の同期待ち等で起こりうるため、iOS向け案内にフォールバックする。
function billingIssueDescription(platform: Platform | null): string {
  if (platform === "android") {
    return "Pro 機能を継続するため Google Play の決済情報をご確認ください。";
  }
  if (platform === "web") {
    return "Pro 機能を継続するため、メールでお送りしたお支払いページからカード情報を更新してください。";
  }
  return "Pro 機能を継続するため App Store の決済情報をご確認ください。";
}

/**
 * billing_issue 状態のときだけ表示する警告バナー。
 * タップで /account/subscription に遷移し、ユーザーに次のアクションを案内する。
 */
export function BillingIssueAlert({ subscription }: BillingIssueAlertProps) {
  const router = useRouter();

  if (subscription.status !== "billing_issue") return null;

  return (
    <TouchableOpacity
      style={styles.banner}
      onPress={() => router.push("/account/subscription")}
      accessibilityRole="button"
      accessibilityLabel="決済情報の更新を案内"
    >
      <Text style={styles.label}>決済情報の更新が必要です</Text>
      <Text style={styles.description}>
        {billingIssueDescription(subscription.platform)}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: "#7f1d1d",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  label: {
    color: "#F4F4F4",
    fontSize: 13,
    fontWeight: "700",
  },
  description: {
    color: "#fecaca",
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
});

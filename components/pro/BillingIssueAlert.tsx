import type { ProSubscription } from "../../types/pro";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface BillingIssueAlertProps {
  subscription: ProSubscription;
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
        Pro 機能を継続するため App Store の決済情報をご確認ください。
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

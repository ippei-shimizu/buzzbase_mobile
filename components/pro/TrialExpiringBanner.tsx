import type { ProSubscription } from "../../types/pro";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface TrialExpiringBannerProps {
  subscription: ProSubscription;
}

const TRIAL_WARN_DAYS = 3;
const BANNER_PADDING_VERTICAL = 10;

/**
 * 予告バナーを表示すべきか。バナーの有無でセーフエリアの扱いを変える
 * (tabs)/_layout からも参照するため、判定をコンポーネントの外に出している。
 */
export function shouldShowTrialExpiringBanner(
  subscription: ProSubscription,
): boolean {
  if (!subscription.in_trial) return false;
  const days = subscription.days_remaining;
  return days !== null && days <= TRIAL_WARN_DAYS;
}

/**
 * トライアル終了 3 日以内のときだけ表示する予告バナー。
 * 自動課金開始の認識合わせと、解約導線への入口を担う。
 */
export function TrialExpiringBanner({
  subscription,
}: TrialExpiringBannerProps) {
  const router = useRouter();
  // Tabs より上に描画されるためヘッダーの上部インセットが効かない。ステータスバーと
  // 重ならないよう、このバナー自身で上部インセットを確保する。
  const insets = useSafeAreaInsets();

  if (!shouldShowTrialExpiringBanner(subscription)) return null;
  const days = subscription.days_remaining;

  return (
    <TouchableOpacity
      style={[
        styles.banner,
        { paddingTop: insets.top + BANNER_PADDING_VERTICAL },
      ]}
      onPress={() => router.push("/account/subscription")}
      accessibilityRole="button"
      accessibilityLabel="トライアル期限の予告"
    >
      <Text style={styles.label}>トライアルはあと {days} 日で終了します</Text>
      <Text style={styles.description}>
        終了後は自動課金が始まります。解約方法は「サブスクリプション管理」から確認できます。
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: "#78350f",
    paddingHorizontal: 16,
    paddingBottom: BANNER_PADDING_VERTICAL,
  },
  label: {
    color: "#F4F4F4",
    fontSize: 13,
    fontWeight: "700",
  },
  description: {
    color: "#fed7aa",
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
});

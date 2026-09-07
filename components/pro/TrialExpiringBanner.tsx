import type { ProSubscription } from "../../types/pro";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CloseIcon } from "../icon/CloseIcon";

interface TrialExpiringBannerProps {
  subscription: ProSubscription;
  /** 閉じた判定。読み込み完了まで null（確定前はバナーを描画しない） */
  dismissed: boolean | null;
  onDismiss: () => void;
}

const TRIAL_WARN_DAYS = 1;
const BANNER_PADDING_VERTICAL = 10;

/**
 * 予告バナーを表示すべきか。バナーの有無でセーフエリアの扱いを変える
 * (tabs)/_layout からも参照するため、判定をコンポーネントの外に出している。
 * 閉じた状態（dismissed）も含めて判定しないと、閉じたのに top: 0 のままになり
 * ヘッダーがステータスバーに詰まるため、親と同じ引数で共有する。
 */
export function shouldShowTrialExpiringBanner(
  subscription: ProSubscription,
  dismissed: boolean | null,
): boolean {
  if (dismissed !== false) return false;
  if (!subscription.in_trial) return false;
  // 閉じた状態は expires_at にひもづけて保存するため、null だと閉じられないバナーになる。
  if (subscription.expires_at === null) return false;
  const days = subscription.days_remaining;
  return days !== null && days <= TRIAL_WARN_DAYS;
}

/**
 * トライアル最終日にだけ表示する予告バナー。
 * 3日前からの告知はメールと push が担うため、アプリ内は最終日の念押しに絞る。
 * 自動課金開始の認識合わせと、解約導線への入口を担う。
 */
export function TrialExpiringBanner({
  subscription,
  dismissed,
  onDismiss,
}: TrialExpiringBannerProps) {
  const router = useRouter();
  // Tabs より上に描画されるためヘッダーの上部インセットが効かない。ステータスバーと
  // 重ならないよう、このバナー自身で上部インセットを確保する。
  const insets = useSafeAreaInsets();

  if (!shouldShowTrialExpiringBanner(subscription, dismissed)) return null;
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
      <View style={styles.row}>
        <View style={styles.texts}>
          <Text style={styles.label}>
            トライアルはあと {days} 日で終了します
          </Text>
          <Text style={styles.description}>
            終了後は自動課金が始まります。解約方法は「サブスクリプション管理」から確認できます。
          </Text>
        </View>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onDismiss}
          hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
          accessibilityRole="button"
          accessibilityLabel="トライアル期限の予告を閉じる"
        >
          <CloseIcon size={18} color="#fed7aa" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: "#78350f",
    paddingHorizontal: 16,
    paddingBottom: BANNER_PADDING_VERTICAL,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  texts: {
    flex: 1,
  },
  closeButton: {
    marginLeft: 12,
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

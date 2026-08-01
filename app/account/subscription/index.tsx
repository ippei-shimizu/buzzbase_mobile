import { Redirect, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { CancelGuideModal } from "@components/pro/CancelGuideModal";
import { SubscriptionStatusCard } from "@components/pro/SubscriptionStatusCard";
import { WebCancelConfirmModal } from "@components/pro/WebCancelConfirmModal";
import { useFeatureFlag } from "@hooks/useFeatureFlag";
import { useProStatus } from "@hooks/useProStatus";

export default function SubscriptionScreen() {
  const router = useRouter();
  const { enabled: proFeatures, isLoading: flagLoading } =
    useFeatureFlag("pro_features");
  const { proStatus, isLoading, isError, refetch } = useProStatus();
  const [cancelGuideOpen, setCancelGuideOpen] = useState(false);

  // flag 取得中に false 倒しで redirect すると、Pro ユーザーが初回アクセスでこの画面を開けない。
  if (flagLoading || isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#d08000" />
      </View>
    );
  }

  if (!proFeatures) return <Redirect href="/" />;

  // API エラー時に DEFAULT_PRO_STATUS（無料状態）で描画すると、Pro 加入者に
  // 「未加入」と誤表示してしまうため、エラーであることを明示して再試行導線を出す。
  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>状態の取得に失敗しました</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => refetch()}
          accessibilityRole="button"
          accessibilityLabel="再試行"
        >
          <Text style={styles.retryButtonText}>再試行</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const showJoinCta =
    proStatus.subscription.status === "free" ||
    proStatus.subscription.status === "expired";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SubscriptionStatusCard
        subscription={proStatus.subscription}
        onPressCancelGuide={() => setCancelGuideOpen(true)}
      />

      {showJoinCta ? (
        <TouchableOpacity
          style={styles.joinButton}
          onPress={() => router.push("/pro")}
          accessibilityRole="button"
          accessibilityLabel="Pro に加入する"
        >
          <Text style={styles.joinButtonText}>Pro に加入する</Text>
        </TouchableOpacity>
      ) : null}

      {proStatus.subscription.platform === "web" ? (
        <WebCancelConfirmModal
          isOpen={cancelGuideOpen}
          onClose={() => setCancelGuideOpen(false)}
        />
      ) : (
        <CancelGuideModal
          isOpen={cancelGuideOpen}
          onClose={() => setCancelGuideOpen(false)}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2E2E2E",
  },
  content: {
    padding: 16,
    gap: 16,
  },
  center: {
    flex: 1,
    backgroundColor: "#2E2E2E",
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    color: "#D4D4D4",
    fontSize: 14,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#424242",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#F4F4F4",
    fontSize: 14,
    fontWeight: "700",
  },
  joinButton: {
    backgroundColor: "#d08000",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  joinButtonText: {
    color: "#F4F4F4",
    fontSize: 15,
    fontWeight: "700",
  },
});

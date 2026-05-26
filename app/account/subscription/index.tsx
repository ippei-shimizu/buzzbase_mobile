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
import { useFeatureFlag } from "@hooks/useFeatureFlag";
import { useProStatus } from "@hooks/useProStatus";

export default function SubscriptionScreen() {
  const router = useRouter();
  const proFeatures = useFeatureFlag("pro_features");
  const { proStatus, isLoading } = useProStatus();
  const [cancelGuideOpen, setCancelGuideOpen] = useState(false);

  if (!proFeatures) return <Redirect href="/" />;

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#d08000" />
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

      <CancelGuideModal
        isOpen={cancelGuideOpen}
        onClose={() => setCancelGuideOpen(false)}
      />
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

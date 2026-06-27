import { useRouter } from "expo-router";
import React from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Heatmap } from "@components/grass/Heatmap";
import { StreakBadge } from "@components/grass/StreakBadge";
import { useActivityHeatmap, useStreak } from "@hooks/useActivity";
import { useEntitlement } from "@hooks/useEntitlement";

export default function ActivityScreen() {
  const router = useRouter();
  const { heatmap, isLoading } = useActivityHeatmap();
  const { streak } = useStreak();
  const { hasEntitlement } = useEntitlement();
  const isPro = hasEntitlement("grass_full_history");

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#d08000" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {streak ? (
        <StreakBadge
          current={streak.current_streak_days}
          longest={streak.longest_streak_days}
        />
      ) : null}

      <View style={styles.card}>
        {heatmap ? (
          <Heatmap data={heatmap.data} from={heatmap.from} to={heatmap.to} />
        ) : null}
      </View>

      {streak ? (
        <Text style={styles.total}>通算 {streak.total_active_days}日</Text>
      ) : null}

      {!isPro ? (
        <View style={styles.proCard}>
          <Text style={styles.proTitle}>Pro で全期間の草を表示</Text>
          <Text style={styles.proText}>
            無料では直近30日まで表示されます。Pro
            なら全期間・年ビューを確認できます。
          </Text>
          <TouchableOpacity
            style={styles.proButton}
            onPress={() => router.push("/pro")}
          >
            <Text style={styles.proButtonText}>Pro を見る</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#2E2E2E" },
  content: { padding: 16, paddingBottom: 40 },
  centered: {
    flex: 1,
    backgroundColor: "#2E2E2E",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#3A3A3A",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  total: { color: "#A1A1AA", fontSize: 13, marginTop: 12 },
  proCard: {
    backgroundColor: "#3A3A3A",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  proTitle: { color: "#F4F4F4", fontSize: 15, fontWeight: "700" },
  proText: { color: "#A1A1AA", fontSize: 13, marginTop: 6, marginBottom: 12 },
  proButton: {
    backgroundColor: "#d08000",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  proButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
});

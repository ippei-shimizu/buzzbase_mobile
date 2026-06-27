import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useShadowSwingStats } from "@hooks/useShadowSwing";

export default function ShadowSwingCompleteScreen() {
  const router = useRouter();
  const { swingCount } = useLocalSearchParams<{ swingCount: string }>();
  const { stats } = useShadowSwingStats();

  return (
    <View style={styles.container}>
      <Ionicons name="checkmark-circle" size={56} color="#17C964" />
      <Text style={styles.title}>
        {Number(swingCount).toLocaleString()}本 達成！
      </Text>
      <Text style={styles.subtitle}>練習記録に保存しました</Text>

      {stats ? (
        <View style={styles.statsCard}>
          <StatRow label="今日" value={stats.today_count} />
          <StatRow label="今月" value={stats.month_count} />
          <StatRow label="通算" value={stats.total_count} />
        </View>
      ) : null}

      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.replace("/(shadow-swing)/setup")}
        >
          <Text style={styles.secondaryText}>もう一度</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.dismissAll()}
        >
          <Text style={styles.primaryText}>閉じる</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value.toLocaleString()}本</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2E2E2E",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    color: "#F4F4F4",
    fontSize: 24,
    fontWeight: "800",
    marginTop: 16,
  },
  subtitle: { color: "#A1A1AA", fontSize: 14, marginTop: 8 },
  statsCard: {
    width: "100%",
    backgroundColor: "#3A3A3A",
    borderRadius: 12,
    padding: 16,
    marginTop: 28,
    gap: 10,
  },
  statRow: { flexDirection: "row", justifyContent: "space-between" },
  statLabel: { color: "#A1A1AA", fontSize: 14 },
  statValue: { color: "#F4F4F4", fontSize: 15, fontWeight: "700" },
  buttons: { flexDirection: "row", gap: 12, marginTop: 32 },
  secondaryButton: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 8,
    backgroundColor: "#424242",
  },
  secondaryText: { color: "#F4F4F4", fontSize: 16, fontWeight: "700" },
  primaryButton: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 8,
    backgroundColor: "#d08000",
  },
  primaryText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
});

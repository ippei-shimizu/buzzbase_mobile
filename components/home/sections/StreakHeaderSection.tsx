import { useRouter } from "expo-router";
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Heatmap } from "@components/grass/Heatmap";
import { StreakBadge } from "@components/grass/StreakBadge";
import { useActivityHeatmap, useStreak } from "@hooks/useActivity";
import { useEntitlement } from "@hooks/useEntitlement";
import { useStreakReminder } from "@hooks/useStreakReminder";
import { SectionCard } from "./SectionCard";

const pad = (value: number): string => String(value).padStart(2, "0");
const dateString = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/** 継続ヘッダー（Streak ＋ 草ヒートマップ詳細）。ホームに詳細をそのまま表示する。 */
export function StreakHeaderSection() {
  const router = useRouter();
  const { streak } = useStreak();
  const { heatmap } = useActivityHeatmap();
  const { hasEntitlement } = useEntitlement();
  const isPro = hasEntitlement("grass_full_history");

  const todayStr = dateString(new Date());
  const todayActive = Boolean(
    heatmap?.data.some(
      (log) => log.activity_date === todayStr && log.intensity_level > 0,
    ),
  );
  useStreakReminder(streak?.current_streak_days ?? 0, todayActive);

  return (
    <SectionCard title="継続">
      <StreakBadge
        current={streak?.current_streak_days ?? 0}
        longest={streak?.longest_streak_days ?? 0}
      />
      {heatmap ? (
        <View style={styles.heatmap}>
          <Heatmap
            data={heatmap.data}
            from={heatmap.from}
            to={heatmap.to}
            interactive
            showLabels
          />
        </View>
      ) : null}
      <Text style={styles.summary}>
        通算 {streak?.total_active_days ?? 0}日
      </Text>

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
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  heatmap: { marginTop: 12 },
  summary: { color: "#A1A1AA", fontSize: 12, marginTop: 10 },
  proCard: {
    backgroundColor: "#2E2E2E",
    borderRadius: 10,
    padding: 14,
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

import { useRouter } from "expo-router";
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Heatmap } from "@components/grass/Heatmap";
import { StreakBadge } from "@components/grass/StreakBadge";
import { useActivityHeatmap, useStreak } from "@hooks/useActivity";
import { useStreakReminder } from "@hooks/useStreakReminder";
import { SectionCard } from "./SectionCard";

const pad = (value: number): string => String(value).padStart(2, "0");
const dateString = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const today = (): Date => new Date();
const weeksAgo = (weeks: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - weeks * 7);
  return date;
};

/** 継続ヘッダー（Streak ＋ 直近12週の草ミニ）。タップで草の詳細へ。 */
export function StreakHeaderSection() {
  const router = useRouter();
  const { streak } = useStreak();
  const from = dateString(weeksAgo(12));
  const to = dateString(today());
  const { heatmap } = useActivityHeatmap({ from, to });

  const todayStr = dateString(today());
  const todayActive = Boolean(
    heatmap?.data.some(
      (log) => log.activity_date === todayStr && log.intensity_level > 0,
    ),
  );
  useStreakReminder(streak?.current_streak_days ?? 0, todayActive);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => router.push("/activity")}
    >
      <SectionCard title="継続">
        <StreakBadge
          current={streak?.current_streak_days ?? 0}
          longest={streak?.longest_streak_days ?? 0}
        />
        {heatmap ? (
          <View style={styles.mini}>
            <Heatmap
              data={heatmap.data}
              from={heatmap.from}
              to={heatmap.to}
              cellSize={10}
              scroll={false}
            />
          </View>
        ) : null}
        <Text style={styles.summary}>
          通算 {streak?.total_active_days ?? 0}日
        </Text>
      </SectionCard>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  mini: { marginTop: 12 },
  summary: { color: "#A1A1AA", fontSize: 12, marginTop: 10 },
});

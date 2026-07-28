import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Heatmap } from "@components/grass/Heatmap";
import { StreakBadge } from "@components/grass/StreakBadge";
import { PaywallModal } from "@components/pro/PaywallModal";
import { ProUpsellCard } from "@components/pro/ProUpsellCard";
import { useActivityHeatmap, useStreak } from "@hooks/useActivity";
import { useEntitlement } from "@hooks/useEntitlement";
import { useShadowSwingStats } from "@hooks/useShadowSwing";
import { useStreakReminder } from "@hooks/useStreakReminder";
import { addDays, todayIso } from "@utils/planDate";
import { SectionCard } from "./SectionCard";

// ホームの草ミニは常に直近12週(84日)固定。全期間・年ビューは詳細画面(F-05/F-11)で見せる。
const HOME_HEATMAP_WEEKS = 12;

const pad = (value: number): string => String(value).padStart(2, "0");
const dateString = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

// 到達したくなる節目。次の節目までの残りを「もう少しで届く報酬」として提示する。
const ACTIVE_DAY_MILESTONES = [10, 30, 50, 100, 150, 200, 300, 365, 500, 1000];
const SWING_MILESTONES = [1000, 5000, 10_000, 30_000, 50_000, 100_000];

const nextMilestone = (current: number, milestones: number[]): number | null =>
  milestones.find((milestone) => milestone > current) ?? null;

/** 今日記録する動機になる一言（損失回避・自己ベスト意識）を返す。 */
const streakNudge = (
  current: number,
  longest: number,
  todayActive: boolean,
): string => {
  if (todayActive) {
    return current >= longest && current > 0
      ? `自己ベスト更新中！${current}日連続`
      : `${current}日連続中！今日も記録済み`;
  }
  if (current === 0) return "今日から連続記録を始めよう";
  const next = current + 1;
  if (next > longest) return `今日記録すれば自己ベスト更新の${next}日連続`;
  if (next === longest) return `今日記録すれば自己ベスト(${longest}日)に並ぶ`;
  return `今日記録すれば${next}日連続`;
};

/** 継続ヘッダー（Streak ＋ 草ヒートマップ詳細）。ホームに詳細をそのまま表示する。 */
export function StreakHeaderSection() {
  const router = useRouter();
  const homeFrom = addDays(todayIso(), -(HOME_HEATMAP_WEEKS * 7 - 1));
  const homeTo = todayIso();
  const { streak } = useStreak();
  const { heatmap } = useActivityHeatmap({ from: homeFrom, to: homeTo });
  const { hasEntitlement, isLoading: isProLoading } = useEntitlement();
  const isPro = hasEntitlement("grass_full_history");
  const [isPaywallOpen, setPaywallOpen] = useState(false);
  const goDetail = () => router.push("/(grass)/detail");

  const { stats: swingStats } = useShadowSwingStats();

  const todayStr = dateString(new Date());
  const todayActive = Boolean(
    heatmap?.data.some(
      (log) => log.activity_date === todayStr && log.intensity_level > 0,
    ),
  );
  const currentStreak = streak?.current_streak_days ?? 0;
  const longestStreak = streak?.longest_streak_days ?? 0;
  const totalActiveDays = streak?.total_active_days ?? 0;
  useStreakReminder(currentStreak, todayActive);

  const nudge = streakNudge(currentStreak, longestStreak, todayActive);
  const nextActiveDay = nextMilestone(totalActiveDays, ACTIVE_DAY_MILESTONES);
  const swingTotal = swingStats?.total_count ?? 0;
  const nextSwing = nextMilestone(swingTotal, SWING_MILESTONES);

  return (
    <SectionCard title="継続">
      <StreakBadge current={currentStreak} longest={longestStreak} />

      <View style={styles.nudge}>
        <Ionicons name="flame" size={16} color="#d08000" />
        <Text style={styles.nudgeText}>{nudge}</Text>
      </View>
      {heatmap ? (
        <View style={styles.heatmap}>
          <Heatmap
            data={heatmap.data}
            from={homeFrom}
            to={homeTo}
            scroll={false}
            lockedBefore={!isProLoading && !isPro ? heatmap.from : undefined}
            onLockedPress={() => setPaywallOpen(true)}
            onCellPress={goDetail}
          />
        </View>
      ) : null}
      <TouchableOpacity
        style={styles.detailLink}
        onPress={goDetail}
        accessibilityRole="button"
      >
        <Text style={styles.detailLinkText}>詳細を見る</Text>
        <Ionicons name="chevron-forward" size={14} color="#A1A1AA" />
      </TouchableOpacity>
      <Text style={styles.summary}>通算 {totalActiveDays}日</Text>

      {nextActiveDay != null ? (
        <View style={styles.milestone}>
          <Ionicons name="trophy-outline" size={13} color="#A1A1AA" />
          <Text style={styles.milestoneText}>
            通算{nextActiveDay}日まであと{nextActiveDay - totalActiveDays}日
          </Text>
        </View>
      ) : null}
      {nextSwing != null && swingTotal > 0 ? (
        <View style={styles.milestone}>
          <Ionicons name="baseball-outline" size={13} color="#A1A1AA" />
          <Text style={styles.milestoneText}>
            素振り累計{nextSwing.toLocaleString()}本まであと
            {(nextSwing - swingTotal).toLocaleString()}本
          </Text>
        </View>
      ) : null}

      {!isProLoading && !isPro ? (
        <View style={styles.proCardWrapper}>
          <ProUpsellCard
            feature="grass_full_history"
            title="Pro で全期間の記録マップを表示"
            description="無料では直近30日まで表示されます。Pro なら全期間・年ビューを確認できます。"
            onPressCta={() => setPaywallOpen(true)}
            style={styles.proCardDark}
          />
        </View>
      ) : null}
      <PaywallModal
        isOpen={isPaywallOpen}
        onClose={() => setPaywallOpen(false)}
        feature="grass_full_history"
      />
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  heatmap: { marginTop: 12 },
  detailLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginTop: 10,
    alignSelf: "flex-start",
  },
  detailLinkText: { color: "#A1A1AA", fontSize: 12, fontWeight: "600" },
  nudge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
  },
  nudgeText: {
    color: "#F4F4F4",
    fontSize: 14,
    fontWeight: "700",
    flexShrink: 1,
  },
  summary: { color: "#A1A1AA", fontSize: 12, marginTop: 10 },
  milestone: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 6,
  },
  milestoneText: { color: "#A1A1AA", fontSize: 12, flexShrink: 1 },
  proCardWrapper: { marginTop: 16 },
  proCardDark: { backgroundColor: "#1A1A1A" },
});

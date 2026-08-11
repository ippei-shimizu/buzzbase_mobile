import type { Goal } from "../../types/goal";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import { GoalProgressBar } from "@components/goal/GoalProgressBar";
import { PaywallModal } from "@components/pro/PaywallModal";
import { SwipeableTabPages } from "@components/ui/SwipeableTabPages";
import {
  GOAL_PERIOD_LABELS,
  GOAL_PERIOD_ORDER,
  MONTHLY_GOAL_FREE_LIMIT,
  PERSONAL_GOAL_PERIOD_TYPES,
} from "@constants/goal";
import { useEntitlement } from "@hooks/useEntitlement";
import { useGoalHistory, useGoalMutations, useGoals } from "@hooks/useGoals";

type GoalTab = "in_progress" | "achieved" | "unachieved";

const TABS: { key: GoalTab; label: string }[] = [
  { key: "in_progress", label: "進行中" },
  { key: "achieved", label: "達成" },
  { key: "unachieved", label: "未達" },
];

const TAB_KEYS = TABS.map((item) => item.key);

const EMPTY_MESSAGE: Record<GoalTab, string> = {
  in_progress: "進行中の目標はありません",
  achieved: "達成した目標はまだありません",
  unachieved: "未達で終わった目標はありません",
};

/** タブごとの分類。達成は手動達成した進行中も含め、未達は期限到来後に未達で確定したもの。 */
const categorize = (goal: Goal): GoalTab => {
  if (goal.is_achieved) return "achieved";
  if (goal.is_finalized) return "unachieved";
  return "in_progress";
};

export default function GoalListScreen() {
  const router = useRouter();
  const { hasEntitlement, isLoading: isProLoading } = useEntitlement();
  const { goals: activeGoals, isLoading } = useGoals();
  const { goals: historyGoals, isLoading: isHistoryLoading } = useGoalHistory();
  const { achieveGoal, unachieveGoal } = useGoalMutations();
  const [tab, setTab] = useState<GoalTab>("in_progress");
  const [isPaywallOpen, setPaywallOpen] = useState(false);

  const goalsByTab = useMemo(() => {
    const buckets: Record<GoalTab, Goal[]> = {
      in_progress: [],
      achieved: [],
      unachieved: [],
    };
    for (const goal of [...activeGoals, ...historyGoals]) {
      buckets[categorize(goal)].push(goal);
    }
    return buckets;
  }, [activeGoals, historyGoals]);

  const handleToggleAchieve = async (id: number, achieved: boolean) => {
    try {
      await (achieved ? unachieveGoal(id) : achieveGoal(id));
    } catch {
      Alert.alert("更新に失敗しました");
    }
  };

  const handleAdd = () => {
    // 個人の期間目標（月次/週次/年間/カスタム）は無料枠を共有する。
    const personalGoalCount = activeGoals.filter((goal) =>
      PERSONAL_GOAL_PERIOD_TYPES.includes(goal.period_type),
    ).length;
    if (
      !hasEntitlement("unlimited_monthly_goals") &&
      personalGoalCount >= MONTHLY_GOAL_FREE_LIMIT
    ) {
      setPaywallOpen(true);
      return;
    }
    router.push("/(goal)/new");
  };

  if (isLoading || isHistoryLoading || isProLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#d08000" />
      </View>
    );
  }

  const renderTabPage = (pageTab: GoalTab) => {
    const goalsInTab = goalsByTab[pageTab];
    return (
      <ScrollView contentContainerStyle={styles.content}>
        {goalsInTab.length === 0 ? (
          <Text style={styles.empty}>{EMPTY_MESSAGE[pageTab]}</Text>
        ) : (
          GOAL_PERIOD_ORDER.map((periodType) => {
            const inType = goalsInTab.filter(
              (goal) => goal.period_type === periodType,
            );
            if (inType.length === 0) return null;
            return (
              <View key={periodType} style={styles.group}>
                <Text style={styles.groupLabel}>
                  {GOAL_PERIOD_LABELS[periodType]}
                </Text>
                {inType.map((goal) => (
                  <View key={goal.id} style={styles.card}>
                    <TouchableOpacity
                      style={styles.cardBar}
                      activeOpacity={0.6}
                      accessibilityRole="button"
                      onPress={() =>
                        router.push({
                          pathname: "/(goal)/[id]",
                          params: { id: String(goal.id) },
                        })
                      }
                    >
                      <GoalProgressBar goal={goal} />
                    </TouchableOpacity>
                    {goal.kind === "qualitative" && !goal.is_finalized ? (
                      <TouchableOpacity
                        onPress={() =>
                          handleToggleAchieve(goal.id, goal.is_achieved)
                        }
                        hitSlop={8}
                        accessibilityRole="button"
                        accessibilityLabel={
                          goal.is_achieved ? "達成を取り消す" : "達成にする"
                        }
                      >
                        <Ionicons
                          name={
                            goal.is_achieved
                              ? "checkmark-circle"
                              : "checkmark-circle-outline"
                          }
                          size={24}
                          color={goal.is_achieved ? "#d08000" : "#71717A"}
                        />
                      </TouchableOpacity>
                    ) : null}
                  </View>
                ))}
              </View>
            );
          })
        )}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.addButtonText}>新しい目標を追加</Text>
        </TouchableOpacity>

        <View style={styles.tabBar}>
          {TABS.map((item) => {
            const active = item.key === tab;
            return (
              <TouchableOpacity
                key={item.key}
                style={[styles.tab, active && styles.tabActive]}
                onPress={() => setTab(item.key)}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>
                  {item.label}
                </Text>
                <Text
                  style={[styles.tabCount, active && styles.tabCountActive]}
                >
                  {goalsByTab[item.key].length}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <SwipeableTabPages
        tabKeys={TAB_KEYS}
        activeKey={tab}
        onChange={setTab}
        renderPage={renderTabPage}
      />
      <PaywallModal
        isOpen={isPaywallOpen}
        onClose={() => setPaywallOpen(false)}
        feature="unlimited_monthly_goals"
        contextMessage={`無料プランで設定できる目標は${MONTHLY_GOAL_FREE_LIMIT}件までのため、追加できません。`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#2E2E2E" },
  content: { padding: 16, paddingBottom: 40 },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2E2E2E",
  },
  header: { paddingHorizontal: 16, paddingTop: 12, gap: 12 },
  tabBar: { flexDirection: "row", gap: 8, paddingBottom: 4 },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#3A3A3A",
  },
  tabActive: { backgroundColor: "#d08000" },
  tabText: { color: "#A1A1AA", fontSize: 14, fontWeight: "700" },
  tabTextActive: { color: "#FFFFFF" },
  tabCount: { color: "#71717A", fontSize: 12, fontWeight: "700" },
  tabCountActive: { color: "#FFFFFF" },
  empty: {
    color: "#A1A1AA",
    fontSize: 14,
    textAlign: "center",
    marginVertical: 24,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#3A3A3A",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 8,
  },
  group: { marginBottom: 16 },
  groupLabel: {
    color: "#A1A1AA",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
  },
  cardBar: { flex: 1 },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#d08000",
    borderRadius: 8,
    paddingVertical: 14,
  },
  addButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
});

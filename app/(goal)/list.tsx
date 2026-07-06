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
import { GOAL_PERIOD_LABELS, GOAL_PERIOD_ORDER } from "@constants/goal";
import { useGoalHistory, useGoalMutations, useGoals } from "@hooks/useGoals";

type GoalTab = "in_progress" | "achieved" | "unachieved";

const TABS: { key: GoalTab; label: string }[] = [
  { key: "in_progress", label: "進行中" },
  { key: "achieved", label: "達成" },
  { key: "unachieved", label: "未達" },
];

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
  const { goals: activeGoals, isLoading } = useGoals();
  const { goals: historyGoals, isLoading: isHistoryLoading } = useGoalHistory();
  const { deleteGoal, achieveGoal, unachieveGoal } = useGoalMutations();
  const [tab, setTab] = useState<GoalTab>("in_progress");

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

  const handleDelete = (id: number, title: string) =>
    Alert.alert("削除しますか？", title, [
      { text: "キャンセル", style: "cancel" },
      { text: "削除", style: "destructive", onPress: () => deleteGoal(id) },
    ]);

  const handleToggleAchieve = async (id: number, achieved: boolean) => {
    try {
      await (achieved ? unachieveGoal(id) : achieveGoal(id));
    } catch {
      Alert.alert("更新に失敗しました");
    }
  };

  if (isLoading || isHistoryLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#d08000" />
      </View>
    );
  }

  const visibleGoals = goalsByTab[tab];

  return (
    <View style={styles.container}>
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
              <Text style={[styles.tabCount, active && styles.tabCountActive]}>
                {goalsByTab[item.key].length}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {visibleGoals.length === 0 ? (
          <Text style={styles.empty}>{EMPTY_MESSAGE[tab]}</Text>
        ) : (
          GOAL_PERIOD_ORDER.map((periodType) => {
            const inType = visibleGoals.filter(
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
                      disabled={goal.is_finalized}
                      onPress={() =>
                        router.push({
                          pathname: "/(goal)/new",
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
                    <TouchableOpacity
                      onPress={() => handleDelete(goal.id, goal.title)}
                      hitSlop={8}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={18}
                        color="#71717A"
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            );
          })
        )}

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/(goal)/new")}
        >
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.addButtonText}>新しい目標を追加</Text>
        </TouchableOpacity>
      </ScrollView>
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
  tabBar: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
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
    marginTop: 12,
  },
  addButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
});

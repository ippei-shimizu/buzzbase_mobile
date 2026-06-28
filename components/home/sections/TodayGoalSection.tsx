import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { GoalProgressBar } from "@components/goal/GoalProgressBar";
import { useGoals } from "@hooks/useGoals";
import { SectionCard, SectionPlaceholder } from "./SectionCard";

/** 今日の目標進捗。 */
export function TodayGoalSection() {
  const router = useRouter();
  const { goals } = useGoals();

  return (
    <SectionCard title="今日の目標">
      {goals.length === 0 ? (
        <SectionPlaceholder message="目標を設定すると、達成度がここに表示されます" />
      ) : (
        goals
          .slice(0, 3)
          .map((goal) => <GoalProgressBar key={goal.id} goal={goal} />)
      )}
      <TouchableOpacity
        style={styles.editRow}
        onPress={() => router.push("/(goal)/list")}
      >
        <Ionicons name="flag-outline" size={14} color="#d08000" />
        <Text style={styles.editText}>目標を管理</Text>
      </TouchableOpacity>
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  editRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d08000",
    backgroundColor: "rgba(208,128,0,0.08)",
  },
  editText: { color: "#d08000", fontSize: 13, fontWeight: "700" },
});

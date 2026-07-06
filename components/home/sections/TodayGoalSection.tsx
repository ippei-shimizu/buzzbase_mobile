import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { GoalProgressBar } from "@components/goal/GoalProgressBar";
import { GOAL_PERIOD_LABELS, GOAL_PERIOD_ORDER } from "@constants/goal";
import { useGoals } from "@hooks/useGoals";
import { SectionCard, SectionPlaceholder } from "./SectionCard";

/** 目標管理（月次・シーズン・大会の種類別に進捗を表示）。 */
export function TodayGoalSection() {
  const router = useRouter();
  const { goals } = useGoals();

  return (
    <SectionCard title="目標管理">
      {goals.length === 0 ? (
        <SectionPlaceholder message="目標を設定すると、達成度がここに表示されます" />
      ) : (
        GOAL_PERIOD_ORDER.map((periodType) => {
          const inType = goals.filter(
            (goal) => goal.period_type === periodType,
          );
          if (inType.length === 0) return null;
          return (
            <View key={periodType} style={styles.group}>
              <Text style={styles.groupLabel}>
                {GOAL_PERIOD_LABELS[periodType]}
              </Text>
              {inType.map((goal) => (
                <View key={goal.id} style={styles.goalCard}>
                  <GoalProgressBar goal={goal} compact />
                </View>
              ))}
            </View>
          );
        })
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
  group: { marginBottom: 8 },
  groupLabel: {
    color: "#A1A1AA",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 6,
  },
  goalCard: {
    backgroundColor: "#2E2E2E",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
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

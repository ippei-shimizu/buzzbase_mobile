import type { Goal } from "../../types/goal";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { formatMetricValue, metricLabel } from "../../constants/goal";

export function GoalProgressBar({ goal }: { goal: Goal }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="flag" size={14} color="#d08000" />
          <Text style={styles.title} numberOfLines={1}>
            {goal.title}
          </Text>
        </View>
        <Text style={styles.percent}>{Math.round(goal.progress_percent)}%</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${goal.progress_percent}%` }]} />
      </View>
      <View style={styles.valuesRow}>
        <View style={styles.valueBlock}>
          <Text style={styles.valueLabel}>現在</Text>
          <Text style={styles.currentValue}>
            {formatMetricValue(goal.metric_key, goal.current_value)}
          </Text>
        </View>
        <Ionicons name="arrow-forward" size={14} color="#71717A" />
        <View style={styles.valueBlock}>
          <Text style={styles.valueLabel}>目標</Text>
          <Text style={styles.targetValue}>
            {formatMetricValue(goal.metric_key, goal.target_value)}
            {goal.comparison_type === "less_than" ? " 以下" : ""}
          </Text>
        </View>
      </View>
      <Text style={styles.meta}>
        {metricLabel(goal.metric_key)} ・ 残り{goal.days_remaining}日
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 8 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1 },
  title: { color: "#F4F4F4", fontSize: 14, fontWeight: "600", flex: 1 },
  percent: { color: "#d08000", fontSize: 14, fontWeight: "700" },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#424242",
    marginTop: 8,
    overflow: "hidden",
  },
  fill: { height: 8, borderRadius: 4, backgroundColor: "#d08000" },
  valuesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
  },
  valueBlock: { flexDirection: "row", alignItems: "baseline", gap: 4 },
  valueLabel: { color: "#A1A1AA", fontSize: 11, fontWeight: "600" },
  currentValue: { color: "#F4F4F4", fontSize: 16, fontWeight: "700" },
  targetValue: { color: "#d08000", fontSize: 16, fontWeight: "800" },
  meta: { color: "#A1A1AA", fontSize: 12, marginTop: 6 },
});

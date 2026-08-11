import type { Goal } from "../../types/goal";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { formatMetricValue, metricLabel } from "../../constants/goal";

export function GoalProgressBar({
  goal,
  compact = false,
}: {
  goal: Goal;
  /** ホームのミニカード用に、現在→目標と残り日数を1行にまとめて高さを抑える。 */
  compact?: boolean;
}) {
  const containerStyle = compact ? styles.containerCompact : styles.container;

  // 定性目標は指標を持たず、達成/未達で表示する。
  if (goal.kind === "qualitative") {
    return (
      <View style={containerStyle}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Ionicons name="flag" size={14} color="#d08000" />
            <Text style={styles.title} numberOfLines={2}>
              {goal.title}
            </Text>
          </View>
          <View
            style={[styles.statusChip, goal.is_achieved && styles.statusDone]}
          >
            <Text
              style={[
                styles.statusText,
                goal.is_achieved && styles.statusTextDone,
              ]}
            >
              {goal.is_achieved ? "達成" : "未達成"}
            </Text>
          </View>
        </View>
        <Text style={styles.meta}>
          {goal.is_finalized ? "確定済み" : `残り${goal.days_remaining}日`}
        </Text>
      </View>
    );
  }

  // 自由指標はユーザー定義の単位、メニュー回数は対象メニューの単位を使う。
  const isManual = goal.kind === "manual";
  const isMenuAmount = goal.metric_key === "menu_practice_amount";
  const unit = isManual
    ? (goal.custom_unit ?? "")
    : isMenuAmount
      ? (goal.practice_menu_unit_label ?? "")
      : "";
  const metricText = isManual
    ? (goal.custom_metric_label ?? "")
    : goal.metric_key === "menu_practice_days" && goal.practice_menu_name
      ? `${goal.practice_menu_name} 継続日数`
      : isMenuAmount && goal.practice_menu_name
        ? `${goal.practice_menu_name} 回数`
        : metricLabel(goal.metric_key);

  const currentText = `${formatMetricValue(goal.metric_key, goal.current_value)}${unit}`;
  const targetText = `${formatMetricValue(goal.metric_key, goal.target_value ?? 0)}${unit}${
    goal.comparison_type === "less_than" ? " 以下" : ""
  }`;
  const remainingText = goal.is_finalized
    ? "確定済み"
    : `残り${goal.days_remaining}日`;

  return (
    <View style={containerStyle}>
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
      {compact ? (
        <Text style={styles.meta}>
          現在 {currentText} → 目標 {targetText} ・ {remainingText}
        </Text>
      ) : (
        <>
          <View style={styles.valuesRow}>
            <View style={styles.valueBlock}>
              <Text style={styles.valueLabel}>現在</Text>
              <Text style={styles.currentValue}>{currentText}</Text>
            </View>
            <Ionicons name="arrow-forward" size={14} color="#71717A" />
            <View style={styles.valueBlock}>
              <Text style={styles.valueLabel}>目標</Text>
              <Text style={styles.targetValue}>{targetText}</Text>
            </View>
          </View>
          <Text style={styles.meta}>
            {metricText} ・ {remainingText}
          </Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 8 },
  containerCompact: { paddingVertical: 2 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1 },
  title: { color: "#F4F4F4", fontSize: 14, fontWeight: "600", flex: 1 },
  percent: { color: "#d08000", fontSize: 14, fontWeight: "700" },
  statusChip: {
    backgroundColor: "#2E2E2E",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  statusDone: { backgroundColor: "#d08000" },
  statusText: { color: "#A1A1AA", fontSize: 12, fontWeight: "700" },
  statusTextDone: { color: "#F4F4F4" },
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

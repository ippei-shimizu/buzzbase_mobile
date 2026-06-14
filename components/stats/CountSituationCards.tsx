import type { CountSituation, CountSituations } from "../../types/stats";
import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface CountSituationCardsProps {
  data: CountSituations;
}

interface CellConfig {
  key: keyof Pick<
    CountSituations,
    "first_pitch" | "favorable_count" | "pinch_count"
  >;
  label: string;
  description: string;
}

const CELLS: readonly CellConfig[] = [
  { key: "first_pitch", label: "初球", description: "初球を振った打席" },
  {
    key: "favorable_count",
    label: "有利カウント",
    description: "ボール > ストライク",
  },
  { key: "pinch_count", label: "追い込み", description: "ストライク 2" },
] as const;

const formatAverage = (situation: CountSituation): string => {
  if (situation.at_bats === 0) return ".---";
  return situation.batting_average.toFixed(3).replace(/^0\./, ".");
};

export const CountSituationCards = ({ data }: CountSituationCardsProps) => {
  if (data.total_target_pa === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>カウント別の打率</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>対象データなし</Text>
          <Text style={styles.emptyNote}>
            新仕様で記録した打席のみが対象です
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>カウント別の打率</Text>
        <Text style={styles.targetCount}>対象 {data.total_target_pa} 打席</Text>
      </View>
      <View style={styles.row}>
        {CELLS.map((cell) => {
          const situation = data[cell.key];
          return (
            <View key={cell.key} style={styles.cell}>
              <Text style={styles.cellLabel}>{cell.label}</Text>
              <Text style={styles.cellAverage}>{formatAverage(situation)}</Text>
              <Text style={styles.cellCount}>
                {situation.at_bats}打数 {situation.hits}安打
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#3A3A3A",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    color: "#F4F4F4",
    fontSize: 16,
    fontWeight: "700",
  },
  targetCount: {
    color: "#A1A1AA",
    fontSize: 11,
  },
  row: {
    flexDirection: "row",
    gap: 8,
  },
  cell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 6,
    backgroundColor: "#27272A",
    borderRadius: 8,
  },
  cellLabel: {
    color: "#A1A1AA",
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 4,
  },
  cellAverage: {
    color: "#F4F4F4",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 4,
  },
  cellCount: {
    color: "#71717A",
    fontSize: 10,
  },
  emptyState: {
    paddingVertical: 32,
    alignItems: "center",
  },
  emptyText: {
    color: "#A1A1AA",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  emptyNote: {
    color: "#71717A",
    fontSize: 11,
  },
});

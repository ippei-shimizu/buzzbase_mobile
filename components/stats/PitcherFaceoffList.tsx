import type { PitcherFaceoff } from "../../types/stats";
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { formatBattingAverage } from "@utils/formatBattingAverage";

interface PitcherFaceoffListProps {
  rows: PitcherFaceoff[];
  minPlateAppearances: number;
}

export const PitcherFaceoffList = ({
  rows,
  minPlateAppearances,
}: PitcherFaceoffListProps) => {
  if (rows.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>対戦投手別</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>対戦データなし</Text>
          <Text style={styles.emptyNote}>
            新仕様で記録した {minPlateAppearances} 打席以上の投手が対象です
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>対戦投手別</Text>
        <Text style={styles.targetCount}>
          対戦 {rows.length} 投手 / {minPlateAppearances} 打席以上
        </Text>
      </View>

      {rows.map((row) => (
        <View key={row.pitcher_id} style={styles.row}>
          <View style={styles.leftCol}>
            <Text style={styles.pitcherName} numberOfLines={1}>
              {row.pitcher_name}
            </Text>
            <Text style={styles.subText}>
              {row.plate_appearances}対戦・主に {row.top_result}
            </Text>
          </View>
          <View style={styles.rightCol}>
            <Text style={styles.average}>
              {formatBattingAverage(row.batting_average, row.at_bats)}
            </Text>
            <Text style={styles.subText}>
              {row.at_bats}-{row.hits}
            </Text>
          </View>
        </View>
      ))}
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
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#27272A",
  },
  leftCol: {
    flex: 1,
  },
  rightCol: {
    alignItems: "flex-end",
  },
  pitcherName: {
    color: "#F4F4F4",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  average: {
    color: "#d08000",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 2,
  },
  subText: {
    color: "#A1A1AA",
    fontSize: 11,
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
    textAlign: "center",
    paddingHorizontal: 16,
  },
});

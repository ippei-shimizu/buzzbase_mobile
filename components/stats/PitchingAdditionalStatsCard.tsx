import type { PitchingSummary } from "../../types/stats";
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { formatEra } from "@utils/formatStats";

interface PitchingAdditionalStatsCardProps {
  data: PitchingSummary;
}

interface CellConfig {
  key: keyof PitchingSummary;
  label: string;
  format: "count" | "innings";
}

// 投球成績テーブル（PITCHING_COLUMNS）と同じ並びで、率指標以外の 16 項目を 4 列 × 4 行で表示する。
const CELLS: readonly CellConfig[] = [
  { key: "appearances", label: "登板", format: "count" },
  { key: "win", label: "勝利", format: "count" },
  { key: "loss", label: "敗戦", format: "count" },
  { key: "hold", label: "ホールド", format: "count" },
  { key: "saves", label: "セーブ", format: "count" },
  { key: "complete_games", label: "完投", format: "count" },
  { key: "shutouts", label: "完封", format: "count" },
  { key: "innings_pitched", label: "投球回", format: "innings" },
  { key: "number_of_pitches", label: "総投球数", format: "count" },
  { key: "hits_allowed", label: "被安打", format: "count" },
  { key: "home_runs_hit", label: "被本塁打", format: "count" },
  { key: "strikeouts", label: "三振", format: "count" },
  { key: "base_on_balls", label: "四球", format: "count" },
  { key: "hit_by_pitch", label: "死球", format: "count" },
  { key: "run_allowed", label: "失点", format: "count" },
  { key: "earned_run", label: "自責点", format: "count" },
] as const;

const formatValue = (value: number, format: CellConfig["format"]): string =>
  format === "innings" ? formatEra(value) : String(value);

export const PitchingAdditionalStatsCard = ({
  data,
}: PitchingAdditionalStatsCardProps) => (
  <View style={styles.container}>
    <View style={styles.grid}>
      {CELLS.map((cell) => (
        <View key={cell.key} style={styles.cell}>
          <Text style={styles.label}>{cell.label}</Text>
          <Text style={styles.value}>
            {formatValue(data[cell.key], cell.format)}
          </Text>
        </View>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#27272a",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  cell: {
    width: "25%",
    paddingVertical: 8,
    alignItems: "center",
  },
  label: {
    color: "#A1A1AA",
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 4,
  },
  value: {
    color: "#F4F4F4",
    fontSize: 16,
    fontWeight: "700",
  },
});

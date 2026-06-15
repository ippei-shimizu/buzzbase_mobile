import type { AdditionalStats } from "../../types/stats";
import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface AdditionalStatsCardProps {
  data: AdditionalStats;
}

type StatKey = keyof AdditionalStats;

interface CellConfig {
  key: StatKey;
  label: string;
  /** "rate" は .XXX 形式、"count" は整数そのまま、"ratio" は小数 3 桁 */
  format: "rate" | "count" | "ratio";
}

// マイページ / ダッシュボードの SummaryStatsTable と同じ並び順で、
// 主要スタッツ (HeadlineStatsCard) 以外の 16 項目を 4 列 × 4 行で表示する。
const CELLS: readonly CellConfig[] = [
  { key: "games", label: "試合", format: "count" },
  { key: "plate_appearances", label: "打席", format: "count" },
  { key: "two_base_hit", label: "二塁打", format: "count" },
  { key: "three_base_hit", label: "三塁打", format: "count" },
  { key: "total_bases", label: "塁打", format: "count" },
  { key: "run", label: "得点", format: "count" },
  { key: "strike_out", label: "三振", format: "count" },
  { key: "base_on_balls", label: "四球", format: "count" },
  { key: "hit_by_pitch", label: "死球", format: "count" },
  { key: "sacrifice_hit", label: "犠打", format: "count" },
  { key: "sacrifice_fly", label: "犠飛", format: "count" },
  { key: "stealing_base", label: "盗塁", format: "count" },
  { key: "caught_stealing", label: "盗塁死", format: "count" },
  { key: "iso", label: "ISO", format: "rate" },
  { key: "isod", label: "ISOD", format: "rate" },
  { key: "bb_per_k", label: "BB/K", format: "ratio" },
] as const;

const formatValue = (value: number, format: CellConfig["format"]): string => {
  switch (format) {
    case "rate":
      // 1.000 以上もありうるので、その場合は先頭の "0." 置換は不要。
      return value >= 1
        ? value.toFixed(3)
        : value.toFixed(3).replace(/^0\./, ".");
    case "ratio":
      return value.toFixed(2);
    case "count":
    default:
      return value.toString();
  }
};

export const AdditionalStatsCard = ({ data }: AdditionalStatsCardProps) => (
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

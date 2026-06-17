import type { PitcherResultCount } from "../../types/stats";
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { formatStatRate } from "@utils/formatStats";

/**
 * 投手別 / 投手属性別のチップタップ展開で共通に使う詳細スタッツグリッド。
 * 2 ブロック構成:
 *   ブロック 1 (7 列): 打率 / 打席 / 打数 / 安打 / 二塁打 / 三塁打 / 本塁打
 *   ブロック 2 (6 列): 三振 / 四球 / 死球 / 出塁率 / 長打率 / OPS
 */
export interface PitcherStatsDetailGridProps {
  plateAppearances: number;
  atBats: number;
  hits: number;
  baseOnBalls: number;
  hitByPitch: number;
  sacrificeFly: number;
  battingAverage: number;
  onBasePercentage: number;
  sluggingPercentage: number;
  ops: number;
  resultCounts: PitcherResultCount[];
}

const PR_NAMES = {
  double: "二塁打",
  triple: "三塁打",
  homerun: "本塁打",
  strikeout: "三振",
} as const;

const countOf = (counts: PitcherResultCount[], name: string): number =>
  counts.find((c) => c.plate_result_name === name)?.count ?? 0;

export const PitcherStatsDetailGrid = ({
  plateAppearances,
  atBats,
  hits,
  baseOnBalls,
  hitByPitch,
  sacrificeFly,
  battingAverage,
  onBasePercentage,
  sluggingPercentage,
  ops,
  resultCounts,
}: PitcherStatsDetailGridProps) => {
  const obpDenom = atBats + baseOnBalls + hitByPitch + sacrificeFly;

  const primary: { label: string; value: string }[] = [
    { label: "打率", value: formatStatRate(battingAverage, atBats) },
    { label: "打席", value: String(plateAppearances) },
    { label: "打数", value: String(atBats) },
    { label: "安打", value: String(hits) },
    {
      label: "二塁打",
      value: String(countOf(resultCounts, PR_NAMES.double)),
    },
    {
      label: "三塁打",
      value: String(countOf(resultCounts, PR_NAMES.triple)),
    },
    {
      label: "本塁打",
      value: String(countOf(resultCounts, PR_NAMES.homerun)),
    },
  ];

  const secondary: { label: string; value: string }[] = [
    {
      label: "三振",
      value: String(countOf(resultCounts, PR_NAMES.strikeout)),
    },
    { label: "四球", value: String(baseOnBalls) },
    { label: "死球", value: String(hitByPitch) },
    { label: "出塁率", value: formatStatRate(onBasePercentage, obpDenom) },
    { label: "長打率", value: formatStatRate(sluggingPercentage, atBats) },
    { label: "OPS", value: formatStatRate(ops, atBats) },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.block}>
        <View style={styles.row}>
          {primary.map((s) => (
            <View key={s.label} style={styles.cell}>
              <Text style={styles.label}>{s.label}</Text>
              <Text style={styles.value}>{s.value}</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.block}>
        <View style={styles.row}>
          {secondary.map((s) => (
            <View key={s.label} style={styles.cell}>
              <Text style={styles.label}>{s.label}</Text>
              <Text style={styles.valueSmall}>{s.value}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    gap: 10,
    backgroundColor: "#2E2E2E",
    borderRadius: 8,
  },
  block: {
    backgroundColor: "#27272A",
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  cell: {
    alignItems: "center",
    minWidth: 36,
  },
  label: {
    color: "#A1A1AA",
    fontSize: 10,
    marginBottom: 2,
  },
  value: {
    color: "#F4F4F4",
    fontSize: 14,
    fontWeight: "700",
  },
  valueSmall: {
    color: "#F4F4F4",
    fontSize: 13,
    fontWeight: "600",
  },
});

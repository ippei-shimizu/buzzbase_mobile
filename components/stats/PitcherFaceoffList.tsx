import type { PitcherFaceoff, PitcherResultCount } from "../../types/stats";
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { formatBattingAverage } from "@utils/formatBattingAverage";

interface PitcherFaceoffListProps {
  rows: PitcherFaceoff[];
  minPlateAppearances: number;
  totalTargetPa: number;
}

const PR_NAMES = {
  single: "ヒット",
  double: "二塁打",
  triple: "三塁打",
  homerun: "本塁打",
  strikeout: "三振",
  walk: "四球",
  hbp: "死球",
} as const;

// result_counts から特定の plate_result_name の件数を取り出す。マスタが
// 増減しても影響しないよう、必要な名前だけ参照する。
const countOf = (counts: PitcherResultCount[], name: string): number =>
  counts.find((c) => c.plate_result_name === name)?.count ?? 0;

const fmtRate = (value: number, denominator: number): string => {
  if (denominator <= 0) return "-";
  return value.toFixed(3).replace(/^0\./, ".");
};

export const PitcherFaceoffList = ({
  rows,
  minPlateAppearances,
  totalTargetPa,
}: PitcherFaceoffListProps) => {
  const [expandedId, setExpandedId] = useState<number | null>(null);

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
          対戦 {rows.length} 投手 / 対象 {totalTargetPa} 打席（
          {minPlateAppearances} 打席以上のみ）
        </Text>
      </View>

      {rows.map((row) => {
        const isExpanded = expandedId === row.pitcher_id;
        return (
          <View key={row.pitcher_id}>
            <TouchableOpacity
              style={styles.row}
              activeOpacity={0.7}
              onPress={() => setExpandedId(isExpanded ? null : row.pitcher_id)}
              accessibilityRole="button"
              accessibilityState={{ expanded: isExpanded }}
            >
              <View style={styles.leftCol}>
                <Text style={styles.pitcherName} numberOfLines={1}>
                  {isExpanded ? "▼" : "▶"} {row.pitcher_name}
                </Text>
                <Text style={styles.subText}>{row.plate_appearances}対戦</Text>
              </View>
              <View style={styles.rightCol}>
                <Text style={styles.average}>
                  {formatBattingAverage(row.batting_average, row.at_bats)}
                </Text>
                <Text style={styles.subText}>
                  {row.at_bats}-{row.hits}
                </Text>
              </View>
            </TouchableOpacity>
            {isExpanded && <PitcherFaceoffExpansion row={row} />}
          </View>
        );
      })}
    </View>
  );
};

interface ExpansionProps {
  row: PitcherFaceoff;
}

const PitcherFaceoffExpansion = ({ row }: ExpansionProps) => {
  const totals: { label: string; value: string }[] = [
    { label: "打席", value: String(row.plate_appearances) },
    { label: "打数", value: String(row.at_bats) },
    { label: "安打", value: String(row.hits) },
    {
      label: "打率",
      value: fmtRate(row.batting_average, row.at_bats),
    },
    {
      label: "出塁",
      value: fmtRate(
        row.on_base_percentage,
        row.at_bats + row.base_on_balls + row.hit_by_pitch + row.sacrifice_fly,
      ),
    },
    {
      label: "長打",
      value: fmtRate(row.slugging_percentage, row.at_bats),
    },
    { label: "OPS", value: fmtRate(row.ops, row.at_bats) },
  ];

  const breakdown: { label: string; value: number }[] = [
    { label: "二塁", value: countOf(row.result_counts, PR_NAMES.double) },
    { label: "三塁", value: countOf(row.result_counts, PR_NAMES.triple) },
    { label: "本塁", value: countOf(row.result_counts, PR_NAMES.homerun) },
    { label: "三振", value: countOf(row.result_counts, PR_NAMES.strikeout) },
    { label: "四球", value: row.base_on_balls },
    { label: "死球", value: row.hit_by_pitch },
  ];

  return (
    <View style={styles.expansion}>
      <View style={styles.statBlock}>
        <View style={styles.statRow}>
          {totals.map((s) => (
            <View key={s.label} style={styles.statCell}>
              <Text style={styles.statLabel}>{s.label}</Text>
              <Text style={styles.statValue}>{s.value}</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.statBlock}>
        <View style={styles.statRow}>
          {breakdown.map((s) => (
            <View key={s.label} style={styles.statCell}>
              <Text style={styles.statLabel}>{s.label}</Text>
              <Text style={styles.statValueSmall}>{s.value}</Text>
            </View>
          ))}
        </View>
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
  expansion: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    gap: 10,
    backgroundColor: "#2E2E2E",
    borderRadius: 8,
    marginBottom: 4,
  },
  statBlock: {
    backgroundColor: "#27272A",
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statCell: {
    alignItems: "center",
    minWidth: 36,
  },
  statLabel: {
    color: "#A1A1AA",
    fontSize: 10,
    marginBottom: 2,
  },
  statValue: {
    color: "#F4F4F4",
    fontSize: 14,
    fontWeight: "700",
  },
  statValueSmall: {
    color: "#F4F4F4",
    fontSize: 13,
    fontWeight: "600",
  },
});

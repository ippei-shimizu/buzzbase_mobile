import type { PitchTypeRow } from "../../types/stats";
import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface PitchTypeCardProps {
  rows: PitchTypeRow[];
  totalTargetPa: number;
}

const formatAverage = (hits: number, atBats: number): string => {
  if (atBats === 0) return ".---";
  return (hits / atBats).toFixed(3).replace(/^0\./, ".");
};

const formatSlugging = (totalBases: number, atBats: number): string => {
  if (atBats === 0) return ".---";
  return (totalBases / atBats).toFixed(3).replace(/^0\./, ".");
};

export const PitchTypeCard = ({ rows, totalTargetPa }: PitchTypeCardProps) => {
  if (totalTargetPa === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>球種別の打率</Text>
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
        <Text style={styles.title}>球種別の打率</Text>
        <Text style={styles.targetCount}>対象 {totalTargetPa} 打席</Text>
      </View>

      <View style={styles.headerRow}>
        <Text style={[styles.cell, styles.headerCell, styles.labelCol]}>
          球種
        </Text>
        <Text style={[styles.cell, styles.headerCell, styles.statCol]}>
          打数
        </Text>
        <Text style={[styles.cell, styles.headerCell, styles.statCol]}>
          安打
        </Text>
        <Text style={[styles.cell, styles.headerCell, styles.statCol]}>
          打率
        </Text>
        <Text style={[styles.cell, styles.headerCell, styles.statCol]}>
          長打率
        </Text>
      </View>

      {rows.map((row) => (
        <View key={row.id} style={styles.row}>
          <Text style={[styles.cell, styles.labelCol, styles.labelCell]}>
            {row.label}
          </Text>
          <Text style={[styles.cell, styles.statCol]}>{row.at_bats}</Text>
          <Text style={[styles.cell, styles.statCol]}>{row.hits}</Text>
          <Text style={[styles.cell, styles.statCol]}>
            {formatAverage(row.hits, row.at_bats)}
          </Text>
          <Text style={[styles.cell, styles.statCol]}>
            {formatSlugging(row.total_bases, row.at_bats)}
          </Text>
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
  headerRow: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#52525B",
  },
  row: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#27272A",
  },
  cell: {
    color: "#F4F4F4",
    fontSize: 13,
    textAlign: "center",
  },
  headerCell: {
    color: "#A1A1AA",
    fontSize: 11,
    fontWeight: "600",
  },
  labelCell: {
    fontWeight: "600",
    textAlign: "left",
  },
  labelCol: {
    flex: 1.6,
  },
  statCol: {
    flex: 1,
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

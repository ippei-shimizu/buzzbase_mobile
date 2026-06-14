import type { HitDirection } from "../../types/stats";
import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface HitDirectionTableProps {
  directions: HitDirection[];
}

const formatAverage = (hits: number, atBats: number): string => {
  if (atBats === 0) return ".---";
  const value = hits / atBats;
  return value.toFixed(3).replace(/^0\./, ".");
};

const formatSlugging = (totalBases: number, atBats: number): string => {
  if (atBats === 0) return ".---";
  const value = totalBases / atBats;
  return value.toFixed(3).replace(/^0\./, ".");
};

export const HitDirectionTable = ({ directions }: HitDirectionTableProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>方向別の結果</Text>

      <View style={styles.headerRow}>
        <Text style={[styles.cell, styles.headerCell, styles.directionCol]}>
          方向
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

      {directions.map((dir) => {
        const isLastInfield = dir.id === 6;
        return (
          <View
            key={dir.id}
            style={[styles.row, isLastInfield && styles.rowDivider]}
          >
            <Text style={[styles.cell, styles.directionCol, styles.labelCell]}>
              {dir.label}
            </Text>
            <Text style={[styles.cell, styles.statCol]}>{dir.at_bats}</Text>
            <Text style={[styles.cell, styles.statCol]}>{dir.hits}</Text>
            <Text style={[styles.cell, styles.statCol]}>
              {formatAverage(dir.hits, dir.at_bats)}
            </Text>
            <Text style={[styles.cell, styles.statCol]}>
              {formatSlugging(dir.total_bases, dir.at_bats)}
            </Text>
          </View>
        );
      })}
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
  title: {
    color: "#F4F4F4",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
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
  // 内野 (1-6) と外野 (7-13) の境界を強調する
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#52525B",
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
  },
  directionCol: {
    flex: 1.2,
  },
  statCol: {
    flex: 1,
  },
});

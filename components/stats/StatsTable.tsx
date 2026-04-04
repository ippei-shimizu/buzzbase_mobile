import type { BattingStatsRow, PitchingStatsRow } from "../../types/stats";
import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";

interface Column<T> {
  key: keyof T;
  label: string;
  width: number;
  format?: (value: number) => string;
  highlight?: boolean;
}

interface StatsTableProps<T> {
  rows: T[];
  columns: Column<T>[];
  labelKey: keyof T;
}

const fmt3 = (v: number) => v.toFixed(3).replace(/^0/, "");
const fmt2 = (v: number) => v.toFixed(2);
const fmtInt = (v: number) => String(v);

export const BATTING_COLUMNS: Column<BattingStatsRow>[] = [
  {
    key: "batting_average",
    label: "打率",
    width: 50,
    format: fmt3,
    highlight: true,
  },
  { key: "games", label: "試合", width: 40, format: fmtInt },
  { key: "plate_appearances", label: "打席", width: 40, format: fmtInt },
  { key: "at_bats", label: "打数", width: 40, format: fmtInt },
  { key: "hit", label: "安打", width: 40, format: fmtInt },
  { key: "two_base_hit", label: "二塁打", width: 44, format: fmtInt },
  { key: "three_base_hit", label: "三塁打", width: 44, format: fmtInt },
  { key: "home_run", label: "本塁打", width: 44, format: fmtInt },
  { key: "total_bases", label: "塁打", width: 40, format: fmtInt },
  { key: "runs_batted_in", label: "打点", width: 40, format: fmtInt },
  { key: "run", label: "得点", width: 40, format: fmtInt },
  { key: "strike_out", label: "三振", width: 40, format: fmtInt },
  { key: "base_on_balls", label: "四球", width: 40, format: fmtInt },
  { key: "hit_by_pitch", label: "死球", width: 40, format: fmtInt },
  { key: "sacrifice_hit", label: "犠打", width: 40, format: fmtInt },
  { key: "sacrifice_fly", label: "犠飛", width: 40, format: fmtInt },
  { key: "stealing_base", label: "盗塁", width: 40, format: fmtInt },
  { key: "caught_stealing", label: "盗塁死", width: 44, format: fmtInt },
  { key: "error", label: "併殺打", width: 44, format: fmtInt },
  { key: "slugging_percentage", label: "長打率", width: 50, format: fmt3 },
  { key: "ops", label: "OPS", width: 50, format: fmt3 },
  { key: "iso", label: "ISO", width: 50, format: fmt3 },
  { key: "bb_per_k", label: "BB/K", width: 50, format: fmt3 },
  { key: "babip", label: "BABIP", width: 50, format: fmt3 },
];

export const PITCHING_COLUMNS: Column<PitchingStatsRow>[] = [
  { key: "era", label: "防御率", width: 50, format: fmt2, highlight: true },
  { key: "appearances", label: "登板", width: 40, format: fmtInt },
  { key: "win", label: "勝利", width: 40, format: fmtInt },
  { key: "loss", label: "敗戦", width: 40, format: fmtInt },
  { key: "hold", label: "ホールド", width: 50, format: fmtInt },
  { key: "saves", label: "セーブ", width: 44, format: fmtInt },
  { key: "complete_games", label: "完投", width: 40, format: fmtInt },
  { key: "shutouts", label: "完封", width: 40, format: fmtInt },
  { key: "innings_pitched", label: "投球回", width: 48, format: fmt2 },
  { key: "hits_allowed", label: "被安打", width: 44, format: fmtInt },
  { key: "home_runs_hit", label: "被本塁打", width: 52, format: fmtInt },
  { key: "strikeouts", label: "三振", width: 40, format: fmtInt },
  { key: "base_on_balls", label: "四球", width: 40, format: fmtInt },
  { key: "hit_by_pitch", label: "死球", width: 40, format: fmtInt },
  { key: "earned_run", label: "自責点", width: 44, format: fmtInt },
  { key: "whip", label: "WHIP", width: 50, format: fmt2 },
  { key: "k_per_nine", label: "K/9", width: 46, format: fmt2 },
  { key: "bb_per_nine", label: "BB/9", width: 46, format: fmt2 },
  { key: "k_bb", label: "K/BB", width: 46, format: fmt2 },
];

export function StatsTable<T extends { label: string }>({
  rows,
  columns,
  labelKey,
}: StatsTableProps<T>) {
  const isCareerRow = (row: T) => row.label === "通算";

  return (
    <View style={styles.tableContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.stickyCell}>
              <Text style={styles.headerLabelText}>
                {String(labelKey) === "label" ? "" : String(labelKey)}
              </Text>
            </View>
            {columns.map((col) => (
              <View
                key={String(col.key)}
                style={[styles.cell, { width: col.width }]}
              >
                <Text style={styles.headerText}>{col.label}</Text>
              </View>
            ))}
          </View>

          {/* Data rows */}
          {rows.map((row, i) => {
            const career = isCareerRow(row);
            return (
              <View
                key={i}
                style={[
                  styles.dataRow,
                  career && styles.careerRow,
                  !career && i < rows.length - 1 && styles.rowBorder,
                ]}
              >
                <View
                  style={[styles.stickyCell, career && styles.careerStickyCell]}
                >
                  <Text
                    style={[styles.labelText, career && styles.careerLabelText]}
                  >
                    {row[labelKey] as string}
                  </Text>
                </View>
                {columns.map((col) => {
                  const val = row[col.key] as number;
                  const formatted = col.format ? col.format(val) : String(val);
                  return (
                    <View
                      key={String(col.key)}
                      style={[styles.cell, { width: col.width }]}
                    >
                      <Text
                        style={[
                          styles.cellText,
                          col.highlight && styles.highlightText,
                          career && styles.careerCellText,
                        ]}
                      >
                        {formatted}
                      </Text>
                    </View>
                  );
                })}
              </View>
            );
          })}
        </View>
      </ScrollView>
      <Text style={styles.scrollHint}>← スクロール →</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tableContainer: { marginBottom: 12 },
  headerRow: {
    flexDirection: "row",
    backgroundColor: "#1a1a1a",
  },
  dataRow: { flexDirection: "row" },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: "#1a1a1a" },
  careerRow: {
    backgroundColor: "#2a1a00",
    borderTopWidth: 2,
    borderTopColor: "#f59e0b",
  },
  stickyCell: {
    width: 60,
    paddingVertical: 7,
    paddingHorizontal: 8,
    backgroundColor: "#000",
    borderRightWidth: 1,
    borderRightColor: "#333",
    position: "relative",
  },
  careerStickyCell: { backgroundColor: "#2a1a00" },
  cell: {
    paddingVertical: 7,
    paddingHorizontal: 4,
    alignItems: "center",
  },
  headerText: { color: "#aaa", fontSize: 10, fontWeight: "600" },
  headerLabelText: { color: "#f59e0b", fontSize: 10, fontWeight: "700" },
  labelText: { color: "#ccc", fontSize: 10, fontWeight: "600" },
  careerLabelText: { color: "#f59e0b", fontWeight: "700" },
  cellText: { color: "#ccc", fontSize: 10 },
  highlightText: { color: "#f59e0b", fontWeight: "700" },
  careerCellText: { fontWeight: "600" },
  scrollHint: {
    textAlign: "right",
    color: "#444",
    fontSize: 9,
    marginTop: 2,
    paddingRight: 8,
  },
});

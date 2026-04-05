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

const VERTICAL_CHAR_MAP: Record<string, string> = {
  ー: "｜",
  "/": "／",
};

const toVertical = (text: string) =>
  text
    .split("")
    .map((c) => VERTICAL_CHAR_MAP[c] ?? c)
    .join("\n");

export const BATTING_COLUMNS: Column<BattingStatsRow>[] = [
  {
    key: "batting_average",
    label: "打率",
    width: 48,
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
  { key: "error", label: "失策", width: 40, format: fmtInt },
  { key: "slugging_percentage", label: "長打率", width: 48, format: fmt3 },
  { key: "ops", label: "OPS", width: 48, format: fmt3 },
  { key: "iso", label: "ISO", width: 48, format: fmt3 },
  { key: "bb_per_k", label: "BB/K", width: 48, format: fmt3 },
  { key: "babip", label: "BABIP", width: 50, format: fmt3 },
];

export const PITCHING_COLUMNS: Column<PitchingStatsRow>[] = [
  { key: "era", label: "防御率", width: 48, format: fmt2, highlight: true },
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
  { key: "run_allowed", label: "失点", width: 40, format: fmtInt },
  { key: "earned_run", label: "自責点", width: 44, format: fmtInt },
  { key: "whip", label: "WHIP", width: 48, format: fmt2 },
  { key: "k_per_nine", label: "K/9", width: 44, format: fmt2 },
  { key: "bb_per_nine", label: "BB/9", width: 48, format: fmt2 },
  { key: "k_bb", label: "K/BB", width: 48, format: fmt2 },
];

const ROW_HEIGHT = 36;
const HEADER_HEIGHT = 68;
const FIXED_WIDTH = 70;

export function StatsTable<T extends { label: string; opponent?: string }>({
  rows,
  columns,
  labelKey,
}: StatsTableProps<T>) {
  const isCareerRow = (row: T) => row.label === "通算";
  const hasOpponent = rows.some((r) => r.opponent);
  const fixedWidth = hasOpponent ? 100 : FIXED_WIDTH;
  const rowHeight = hasOpponent ? 46 : ROW_HEIGHT;

  return (
    <View style={styles.tableContainer}>
      <View style={styles.tableBody}>
        {/* 左固定列 */}
        <View style={styles.fixedColumn}>
          {/* 固定列ヘッダー */}
          <View
            style={[
              styles.fixedCell,
              styles.headerBg,
              { width: fixedWidth, height: HEADER_HEIGHT },
            ]}
          >
            <Text style={styles.headerLabelText}>
              {hasOpponent ? "日付" : "年度"}
            </Text>
          </View>
          {/* 固定列データ */}
          {rows.map((row, i) => {
            const career = isCareerRow(row);
            const rowKey = `${row.label}-${row.opponent ?? ""}`;
            return (
              <View
                key={rowKey}
                style={[
                  styles.fixedCell,
                  { width: fixedWidth, height: rowHeight },
                  career ? styles.careerBg : styles.dataBg,
                  career && styles.careerBorder,
                  !career && i < rows.length - 1 && styles.rowBorder,
                ]}
              >
                <Text
                  style={[styles.labelText, career && styles.careerLabelText]}
                  numberOfLines={1}
                >
                  {row[labelKey] as string}
                </Text>
                {row.opponent && !career && (
                  <Text style={styles.opponentText} numberOfLines={1}>
                    {row.opponent}
                  </Text>
                )}
              </View>
            );
          })}
        </View>

        {/* 右スクロール領域（ヘッダー + 全行を一括スクロール） */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            {/* スクロール領域ヘッダー */}
            <View
              style={[
                styles.scrollRow,
                styles.headerBg,
                { height: HEADER_HEIGHT },
              ]}
            >
              {columns.map((col) => (
                <View
                  key={String(col.key)}
                  style={[styles.cell, { width: col.width }]}
                >
                  <Text style={styles.headerText}>{toVertical(col.label)}</Text>
                </View>
              ))}
            </View>
            {/* スクロール領域データ */}
            {rows.map((row, i) => {
              const career = isCareerRow(row);
              const rowKey = `${row.label}-${row.opponent ?? ""}`;
              return (
                <View
                  key={rowKey}
                  style={[
                    styles.scrollRow,
                    { height: rowHeight },
                    career && styles.careerBg,
                    career && styles.careerBorder,
                    !career && i < rows.length - 1 && styles.rowBorder,
                  ]}
                >
                  {columns.map((col) => {
                    const val = row[col.key] as number;
                    const formatted = col.format
                      ? col.format(val)
                      : String(val);
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
      </View>
      <Text style={styles.scrollHint}>← スクロール →</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tableContainer: { marginBottom: 12 },
  tableBody: { flexDirection: "row" },

  // 左固定列
  fixedColumn: {
    zIndex: 1,
    borderRightWidth: 1,
    borderRightColor: "#71717b",
  },
  fixedCell: {
    paddingHorizontal: 10,
    justifyContent: "center",
  },

  // スクロール領域
  scrollRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  cell: {
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
  },

  // 背景
  headerBg: { backgroundColor: "#27272a" },
  dataBg: { backgroundColor: "#2E2E2E" },
  careerBg: { backgroundColor: "#3d2800" },

  // ボーダー
  rowBorder: { borderBottomWidth: 1, borderBottomColor: "#27272a" },
  careerBorder: { borderTopWidth: 2, borderTopColor: "#d08000" },

  // テキスト
  headerText: {
    color: "#A1A1AA",
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 11,
  },
  headerLabelText: { color: "#A1A1AA", fontSize: 11, fontWeight: "600" },
  labelText: { color: "#D4D4D8", fontSize: 13, fontWeight: "600" },
  careerLabelText: { color: "#d08000", fontWeight: "700" },
  cellText: { color: "#F4F4F4", fontSize: 13 },
  highlightText: { color: "#d08000", fontWeight: "700" },
  careerCellText: { fontWeight: "600" },
  opponentText: { color: "#A1A1AA", fontSize: 10, marginTop: 1 },
  scrollHint: {
    textAlign: "right",
    color: "#52525B",
    fontSize: 11,
    marginTop: 2,
    paddingRight: 8,
  },
});

import type { BattingStats, PitchingStats } from "../../types/dashboard";
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { EmptyState } from "../dashboard/EmptyState";

interface ProfileStatsTabProps {
  battingStats?: BattingStats;
  pitchingStats?: PitchingStats;
  seasonFilter?: React.ReactNode;
}

function formatStat(value: number | undefined | null, decimals = 3): string {
  if (value == null) return "-";
  return value.toFixed(decimals);
}

function StatsTable({
  rows,
}: {
  rows: [string, string | number, string, string | number][];
}) {
  return (
    <View style={styles.table}>
      {rows.map((row, i) => (
        <View
          key={i}
          style={[styles.tableRow, i % 2 === 0 && styles.tableRowEven]}
        >
          <Text style={styles.cellLabel}>{row[0]}</Text>
          <Text style={styles.cellValue}>{row[1]}</Text>
          <Text style={styles.cellLabel}>{row[2]}</Text>
          <Text style={styles.cellValue}>{row[3]}</Text>
        </View>
      ))}
    </View>
  );
}

export const ProfileStatsTab = ({
  battingStats,
  pitchingStats,
  seasonFilter,
}: ProfileStatsTabProps) => {
  const hasBatting = battingStats?.aggregate || battingStats?.calculated;
  const hasPitching = pitchingStats?.aggregate || pitchingStats?.calculated;

  const agg = battingStats?.aggregate;
  const calc = battingStats?.calculated;
  const pAgg = pitchingStats?.aggregate;
  const pCalc = pitchingStats?.calculated;

  return (
    <View>
      {seasonFilter && (
        <View style={styles.filterContainer}>{seasonFilter}</View>
      )}

      {!hasBatting && !hasPitching && (
        <EmptyState
          title="成績データがありません"
          subtitle="試合結果を記録すると、ここに成績が表示されます"
          style={{ marginTop: 16 }}
        />
      )}

      {hasBatting && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>打撃成績</Text>

          {calc && agg && (
            <View style={styles.headline}>
              <Text style={styles.headlineRow}>
                <Text style={styles.headlineLabel}>打率 </Text>
                <Text style={styles.headlineValue}>
                  {formatStat(calc.batting_average)}
                </Text>
                <Text style={styles.headlineSub}>
                  {"  "}
                  {agg.number_of_matches}試合
                </Text>
              </Text>
              <Text style={styles.headlineSummary}>
                {agg.times_at_bat}打席 {agg.at_bats}打数 {agg.hit}安打 /{" "}
                {agg.runs_batted_in}打点 {agg.home_run}本塁打
              </Text>
            </View>
          )}

          <StatsTable
            rows={[
              [
                "打率",
                formatStat(calc?.batting_average),
                "試合",
                agg?.number_of_matches ?? "-",
              ],
              ["打席", agg?.times_at_bat ?? "-", "打数", agg?.at_bats ?? "-"],
              ["安打", agg?.hit ?? "-", "二塁打", agg?.two_base_hit ?? "-"],
              [
                "三塁打",
                agg?.three_base_hit ?? "-",
                "本塁打",
                agg?.home_run ?? "-",
              ],
              [
                "塁打",
                agg?.total_bases ?? "-",
                "打点",
                agg?.runs_batted_in ?? "-",
              ],
              ["得点", agg?.run ?? "-", "三振", agg?.strike_out ?? "-"],
              [
                "四球",
                agg?.base_on_balls ?? "-",
                "死球",
                agg?.hit_by_pitch ?? "-",
              ],
              [
                "犠打",
                agg?.sacrifice_hit ?? "-",
                "犠飛",
                agg?.sacrifice_fly ?? "-",
              ],
              [
                "盗塁",
                agg?.stealing_base ?? "-",
                "盗塁死",
                agg?.caught_stealing ?? "-",
              ],
              [
                "出塁率",
                formatStat(calc?.on_base_percentage),
                "長打率",
                formatStat(calc?.slugging_percentage),
              ],
              ["OPS", formatStat(calc?.ops), "ISO", formatStat(calc?.iso)],
              [
                "ISOD",
                formatStat(calc?.isod),
                "BB/K",
                formatStat(calc?.bb_per_k),
              ],
            ]}
          />
        </View>
      )}

      {hasPitching && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>投手成績</Text>

          {pCalc && pAgg && (
            <View style={styles.headline}>
              <Text style={styles.headlineRow}>
                <Text style={styles.headlineLabel}>防御率 </Text>
                <Text style={styles.headlineValue}>
                  {formatStat(pCalc.era, 2)}
                </Text>
                <Text style={styles.headlineSub}>
                  {"  "}
                  {pAgg.number_of_appearances}登板
                </Text>
              </Text>
              <Text style={styles.headlineSummary}>
                {pAgg.win}勝 {pAgg.loss}敗 / {pAgg.innings_pitched}回{" "}
                {pAgg.strikeouts}奪三振
              </Text>
            </View>
          )}

          <StatsTable
            rows={[
              [
                "防御率",
                formatStat(pCalc?.era, 2),
                "登板",
                pAgg?.number_of_appearances ?? "-",
              ],
              ["勝", pAgg?.win ?? "-", "敗", pAgg?.loss ?? "-"],
              [
                "投球回",
                pAgg?.innings_pitched ?? "-",
                "完投",
                pAgg?.complete_games ?? "-",
              ],
              ["完封", pAgg?.shutouts ?? "-", "セーブ", pAgg?.saves ?? "-"],
              [
                "ホールド",
                pAgg?.hold ?? "-",
                "奪三振",
                pAgg?.strikeouts ?? "-",
              ],
              [
                "与四球",
                pAgg?.base_on_balls ?? "-",
                "与死球",
                pAgg?.hit_by_pitch ?? "-",
              ],
              [
                "被安打",
                pAgg?.hits_allowed ?? "-",
                "被本塁打",
                pAgg?.home_runs_hit ?? "-",
              ],
              [
                "失点",
                pAgg?.run_allowed ?? "-",
                "自責点",
                pAgg?.earned_run ?? "-",
              ],
              [
                "勝率",
                formatStat(pCalc?.win_percentage),
                "WHIP",
                formatStat(pCalc?.whip, 2),
              ],
              [
                "K/9",
                formatStat(pCalc?.k_per_nine, 2),
                "BB/9",
                formatStat(pCalc?.bb_per_nine, 2),
              ],
              ["K/BB", formatStat(pCalc?.k_bb, 2), "", ""],
            ]}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    backgroundColor: "#27272a",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  filterContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#d08000",
    marginBottom: 12,
  },
  headline: {
    marginBottom: 16,
  },
  headlineRow: {
    marginBottom: 4,
  },
  headlineLabel: {
    color: "#F4F4F4",
    fontSize: 14,
    fontWeight: "700",
  },
  headlineValue: {
    color: "#F4F4F4",
    fontSize: 20,
    fontWeight: "700",
  },
  headlineSub: {
    color: "#A1A1AA",
    fontSize: 14,
  },
  headlineSummary: {
    color: "#A1A1AA",
    fontSize: 13,
    marginTop: 2,
  },
  table: {
    borderWidth: 1,
    borderColor: "#71717b",
    borderRadius: 8,
    overflow: "hidden",
  },
  tableRow: {
    flexDirection: "row",
  },
  tableRowEven: {},
  cellLabel: {
    flex: 1,
    color: "#A1A1AA",
    fontSize: 13,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#27272a",
    borderBottomWidth: 1,
    borderBottomColor: "#71717b",
    borderRightWidth: 1,
    borderRightColor: "#71717b",
  },
  cellValue: {
    flex: 1,
    color: "#F4F4F4",
    fontSize: 13,
    fontWeight: "600",
    paddingVertical: 10,
    paddingHorizontal: 12,
    textAlign: "center",
    backgroundColor: "#424242",
    borderBottomWidth: 1,
    borderBottomColor: "#71717b",
    borderRightWidth: 1,
    borderRightColor: "#71717b",
  },
});

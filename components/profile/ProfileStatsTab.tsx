import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { BattingStats, PitchingStats } from "../../types/dashboard";
import { EmptyState } from "../dashboard/EmptyState";

interface ProfileStatsTabProps {
  battingStats?: BattingStats;
  pitchingStats?: PitchingStats;
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function formatStat(value: number | undefined | null, decimals = 3): string {
  if (value == null) return "-";
  return value.toFixed(decimals);
}

export const ProfileStatsTab = ({
  battingStats,
  pitchingStats,
}: ProfileStatsTabProps) => {
  const hasBatting = battingStats?.aggregate || battingStats?.calculated;
  const hasPitching = pitchingStats?.aggregate || pitchingStats?.calculated;

  if (!hasBatting && !hasPitching) {
    return (
      <EmptyState
        title="成績データがありません"
        subtitle="試合結果を記録すると、ここに成績が表示されます"
        style={{ marginTop: 16 }}
      />
    );
  }

  return (
    <View>
      {hasBatting && (
        <Card title="打撃成績">
          {battingStats?.calculated && (
            <>
              <Row
                label="打率"
                value={formatStat(battingStats.calculated.batting_average)}
              />
              <Row
                label="OPS"
                value={formatStat(battingStats.calculated.ops)}
              />
              <Row
                label="出塁率"
                value={formatStat(battingStats.calculated.on_base_percentage)}
              />
              <Row
                label="長打率"
                value={formatStat(battingStats.calculated.slugging_percentage)}
              />
              <Row
                label="ISO"
                value={formatStat(battingStats.calculated.iso)}
              />
              <Row
                label="BB/K"
                value={formatStat(battingStats.calculated.bb_per_k, 2)}
              />
            </>
          )}
          {battingStats?.aggregate && (
            <>
              <View style={styles.divider} />
              <Row
                label="試合数"
                value={battingStats.aggregate.number_of_matches}
              />
              <Row label="打数" value={battingStats.aggregate.at_bats} />
              <Row label="安打" value={battingStats.aggregate.hit} />
              <Row label="二塁打" value={battingStats.aggregate.two_base_hit} />
              <Row
                label="三塁打"
                value={battingStats.aggregate.three_base_hit}
              />
              <Row label="本塁打" value={battingStats.aggregate.home_run} />
              <Row label="打点" value={battingStats.aggregate.runs_batted_in} />
              <Row label="得点" value={battingStats.aggregate.run} />
              <Row label="盗塁" value={battingStats.aggregate.stealing_base} />
              <Row label="四球" value={battingStats.aggregate.base_on_balls} />
              <Row label="三振" value={battingStats.aggregate.strike_out} />
            </>
          )}
        </Card>
      )}

      {hasPitching && (
        <Card title="投手成績">
          {pitchingStats?.calculated && (
            <>
              <Row
                label="防御率"
                value={formatStat(pitchingStats.calculated.era, 2)}
              />
              <Row
                label="WHIP"
                value={formatStat(pitchingStats.calculated.whip, 2)}
              />
              <Row
                label="K/9"
                value={formatStat(pitchingStats.calculated.k_per_nine, 2)}
              />
              <Row
                label="BB/9"
                value={formatStat(pitchingStats.calculated.bb_per_nine, 2)}
              />
              <Row
                label="K/BB"
                value={formatStat(pitchingStats.calculated.k_bb, 2)}
              />
              <Row
                label="勝率"
                value={formatStat(pitchingStats.calculated.win_percentage)}
              />
            </>
          )}
          {pitchingStats?.aggregate && (
            <>
              <View style={styles.divider} />
              <Row
                label="登板"
                value={pitchingStats.aggregate.number_of_appearances}
              />
              <Row label="勝" value={pitchingStats.aggregate.win} />
              <Row label="敗" value={pitchingStats.aggregate.loss} />
              <Row
                label="投球回"
                value={pitchingStats.aggregate.innings_pitched}
              />
              <Row label="奪三振" value={pitchingStats.aggregate.strikeouts} />
              <Row
                label="与四球"
                value={pitchingStats.aggregate.base_on_balls}
              />
              <Row label="自責点" value={pitchingStats.aggregate.earned_run} />
              <Row label="セーブ" value={pitchingStats.aggregate.saves} />
              <Row label="ホールド" value={pitchingStats.aggregate.hold} />
            </>
          )}
        </Card>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#424242",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#d08000",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  rowLabel: {
    color: "#A1A1AA",
    fontSize: 14,
  },
  rowValue: {
    color: "#F4F4F4",
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: "#525252",
    marginVertical: 8,
  },
});

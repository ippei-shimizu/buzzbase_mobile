import React from "react";
import { View, Text, StyleSheet, type ViewStyle } from "react-native";
import type { BattingStats, PitchingStats } from "../../types/dashboard";
import {
  normalizeBattingStats,
  normalizePitchingStats,
} from "@utils/radarChartUtils";
import { StatsRadarChart } from "./StatsRadarChart";
import { EmptyState } from "./EmptyState";

interface StatsOverviewProps {
  battingStats: BattingStats;
  pitchingStats: PitchingStats;
  style?: ViewStyle;
}

const StatItem = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.statItem}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

const BattingSection = ({ stats }: { stats: BattingStats }) => {
  const radarData = normalizeBattingStats(stats);
  const { aggregate, calculated } = stats;

  if (!aggregate || !calculated) {
    return <EmptyState title="打撃データがありません" />;
  }

  return (
    <View style={styles.sectionCard}>
      {radarData.length > 0 && (
        <StatsRadarChart data={radarData} color="#d08000" title="打撃" />
      )}
      <View style={styles.statsGrid}>
        <StatItem label="打率" value={calculated.batting_average.toFixed(3)} />
        <StatItem label="本塁打" value={String(aggregate.home_run)} />
        <StatItem label="打点" value={String(aggregate.runs_batted_in)} />
        <StatItem label="OPS" value={calculated.ops.toFixed(3)} />
        <StatItem label="安打" value={String(aggregate.hit)} />
        <StatItem label="盗塁" value={String(aggregate.stealing_base)} />
      </View>
    </View>
  );
};

const PitchingSection = ({ stats }: { stats: PitchingStats }) => {
  const radarData = normalizePitchingStats(stats);
  const { aggregate, calculated } = stats;

  if (!aggregate || !calculated) {
    return <EmptyState title="投手データがありません" />;
  }

  return (
    <View style={styles.sectionCard}>
      {radarData.length > 0 && (
        <StatsRadarChart data={radarData} color="#338EF7" title="投手" />
      )}
      <View style={styles.statsGrid}>
        <StatItem label="防御率" value={calculated.era.toFixed(2)} />
        <StatItem label="勝敗" value={`${aggregate.win}-${aggregate.loss}`} />
        <StatItem label="奪三振" value={String(aggregate.strikeouts)} />
        <StatItem label="WHIP" value={calculated.whip.toFixed(2)} />
        <StatItem label="投球回" value={String(aggregate.innings_pitched)} />
        <StatItem label="セーブ" value={String(aggregate.saves)} />
      </View>
    </View>
  );
};

export const StatsOverview = ({
  battingStats,
  pitchingStats,
  style,
}: StatsOverviewProps) => {
  return (
    <View style={style}>
      <BattingSection stats={battingStats} />
      <PitchingSection stats={pitchingStats} />
    </View>
  );
};

const styles = StyleSheet.create({
  sectionCard: {
    backgroundColor: "#3A3A3A",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
  },
  statItem: {
    width: "33.33%",
    alignItems: "center",
    paddingVertical: 8,
  },
  statLabel: {
    color: "#A1A1AA",
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    color: "#F4F4F4",
    fontSize: 18,
    fontWeight: "700",
  },
});

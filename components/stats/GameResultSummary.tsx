// mobile/components/stats/GameResultSummary.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { WinLossCards } from "./WinLossCards";
import { MatchTypeBreakdown } from "./MatchTypeBreakdown";
import { MonthlyGameChart } from "./MonthlyGameChart";
import { OpponentRecordList } from "./OpponentRecord";
import type { GameSummary } from "../../types/stats";

interface GameResultSummaryProps {
  summary: GameSummary;
}

export const GameResultSummary = ({ summary }: GameResultSummaryProps) => (
  <View style={styles.container}>
    <Text style={styles.sectionHeader}>試合結果</Text>
    <WinLossCards summary={summary.win_loss} />
    <MatchTypeBreakdown breakdown={summary.match_type_breakdown} />
    <MonthlyGameChart games={summary.monthly_games} />
    <OpponentRecordList records={summary.opponent_records} />
  </View>
);

const styles = StyleSheet.create({
  container: { paddingTop: 16, borderTopWidth: 1, borderTopColor: "#222" },
  sectionHeader: {
    fontSize: 15, fontWeight: "700", color: "#fff", marginBottom: 16,
  },
});

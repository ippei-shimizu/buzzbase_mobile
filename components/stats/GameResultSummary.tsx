import type { GameSummary } from "../../types/stats";
import React from "react";
import { View, StyleSheet } from "react-native";
import { MonthlyGameChart } from "./MonthlyGameChart";
import { OpponentRecordList } from "./OpponentRecord";
import { RecentForm } from "./RecentForm";
import { ScoringStats } from "./ScoringStats";
import { WinLossCards } from "./WinLossCards";

interface GameResultSummaryProps {
  summary: GameSummary;
}

export const GameResultSummary = ({ summary }: GameResultSummaryProps) => (
  <View style={styles.container}>
    <WinLossCards summary={summary.win_loss} />
    <ScoringStats scoring={summary.scoring} />
    <RecentForm games={summary.recent_form} />
    <MonthlyGameChart games={summary.monthly_games} />
    <OpponentRecordList records={summary.opponent_records} />
  </View>
);

const styles = StyleSheet.create({
  container: { gap: 0 },
});

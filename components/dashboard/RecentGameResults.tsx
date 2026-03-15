import React from "react";
import { View, Text, StyleSheet, type ViewStyle } from "react-native";
import type { RecentGameResult } from "../../types/dashboard";
import { EmptyState } from "./EmptyState";

interface RecentGameResultsProps {
  results: RecentGameResult[];
  style?: ViewStyle;
}

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

const GameResultCard = ({ game }: { game: RecentGameResult }) => {
  const isWin = game.my_team_score > game.opponent_team_score;
  const isLoss = game.my_team_score < game.opponent_team_score;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.date}>{formatDate(game.date)}</Text>
        <Text style={styles.matchType}>{game.match_type}</Text>
      </View>

      <View style={styles.scoreRow}>
        <Text style={styles.opponent}>
          vs {game.opponent_team_name || "不明"}
        </Text>
        <Text
          style={[
            styles.score,
            isWin && styles.scoreWin,
            isLoss && styles.scoreLoss,
          ]}
        >
          {game.my_team_score} - {game.opponent_team_score}
        </Text>
      </View>

      <View style={styles.statsRow}>
        {game.batting_average && (
          <View style={styles.statGroup}>
            <Text style={styles.statLabel}>打撃</Text>
            <Text style={styles.statValue}>
              {game.batting_average.at_bats}-{game.batting_average.hit}
            </Text>
            {game.batting_average.home_run > 0 && (
              <Text style={styles.statValue}>
                {game.batting_average.home_run}本
              </Text>
            )}
            {game.batting_average.runs_batted_in > 0 && (
              <Text style={styles.statValue}>
                {game.batting_average.runs_batted_in}打点
              </Text>
            )}
          </View>
        )}
        {game.pitching_result && (
          <View style={styles.statGroup}>
            <Text style={styles.statLabel}>投球</Text>
            <Text style={styles.statValue}>
              {game.pitching_result.innings_pitched}回
            </Text>
            <Text style={styles.statValue}>
              {game.pitching_result.strikeouts}K
            </Text>
            <Text style={styles.statValue}>
              自責{game.pitching_result.earned_run}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export const RecentGameResults = ({
  results,
  style,
}: RecentGameResultsProps) => {
  return (
    <View style={style}>
      <Text style={styles.sectionTitle}>直近の試合結果</Text>
      {results.length === 0 ? (
        <EmptyState title="試合結果がありません" />
      ) : (
        results.map((game) => <GameResultCard key={game.id} game={game} />)
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    color: "#F4F4F4",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#3A3A3A",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  date: {
    color: "#A1A1AA",
    fontSize: 13,
  },
  matchType: {
    color: "#A1A1AA",
    fontSize: 12,
    backgroundColor: "#4A4A4A",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: "hidden",
  },
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  opponent: {
    color: "#F4F4F4",
    fontSize: 15,
    fontWeight: "600",
  },
  score: {
    color: "#F4F4F4",
    fontSize: 18,
    fontWeight: "700",
  },
  scoreWin: {
    color: "#d08000",
  },
  scoreLoss: {
    color: "#A1A1AA",
  },
  statsRow: {
    flexDirection: "row",
    gap: 16,
  },
  statGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statLabel: {
    color: "#71717A",
    fontSize: 12,
    fontWeight: "600",
  },
  statValue: {
    color: "#A1A1AA",
    fontSize: 12,
  },
});

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import type { GameResult } from "../../types/gameResult";

interface GameResultListItemProps {
  game: GameResult;
  onPress: (game: GameResult) => void;
}

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

export const GameResultListItem = ({
  game,
  onPress,
}: GameResultListItemProps) => {
  const { match_result, batting_average, pitching_result } = game;
  const isWin = match_result.my_team_score > match_result.opponent_team_score;
  const isLoss = match_result.my_team_score < match_result.opponent_team_score;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(game)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.date}>
          {formatDate(match_result.date_and_time)}
        </Text>
        <Text style={styles.matchType}>{match_result.match_type}</Text>
      </View>

      <View style={styles.scoreRow}>
        <Text style={styles.opponent}>
          vs {match_result.opponent_team_name || "不明"}
        </Text>
        <Text
          style={[
            styles.score,
            isWin && styles.scoreWin,
            isLoss && styles.scoreLoss,
          ]}
        >
          {match_result.my_team_score} - {match_result.opponent_team_score}
        </Text>
      </View>

      <View style={styles.statsRow}>
        {batting_average && (
          <View style={styles.statGroup}>
            <Text style={styles.statLabel}>打撃</Text>
            <Text style={styles.statValue}>
              {batting_average.at_bats}-{batting_average.hit}
            </Text>
            {batting_average.home_run > 0 && (
              <Text style={styles.statValue}>{batting_average.home_run}本</Text>
            )}
            {batting_average.runs_batted_in > 0 && (
              <Text style={styles.statValue}>
                {batting_average.runs_batted_in}打点
              </Text>
            )}
          </View>
        )}
        {pitching_result && (
          <View style={styles.statGroup}>
            <Text style={styles.statLabel}>投球</Text>
            <Text style={styles.statValue}>
              {pitching_result.innings_pitched}回
            </Text>
            <Text style={styles.statValue}>{pitching_result.strikeouts}K</Text>
            <Text style={styles.statValue}>
              自責{pitching_result.earned_run}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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

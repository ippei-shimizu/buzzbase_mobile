import type { RecentGameResult } from "../../types/dashboard";
import { useRouter } from "expo-router";
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  type ViewStyle,
} from "react-native";
import { useProfile } from "@hooks/useProfile";
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
  const router = useRouter();
  const { profile } = useProfile();
  const isWin = game.my_team_score > game.opponent_team_score;
  const isLoss = game.my_team_score < game.opponent_team_score;

  const handlePress = () => {
    router.push({
      pathname: "/game-result-detail",
      params: {
        game: JSON.stringify({
          game_result_id: game.id,
          user_id: profile?.id ?? 0,
          season_id: null,
          season_name: null,
          match_result: {
            id: game.id,
            date_and_time: game.date,
            match_type: game.match_type,
            my_team_id: 0,
            opponent_team_id: 0,
            my_team_score: game.my_team_score,
            opponent_team_score: game.opponent_team_score,
            batting_order: "",
            defensive_position: "",
            tournament_id: null,
            memo: null,
            my_team_name: "",
            opponent_team_name: game.opponent_team_name || "不明",
            tournament_name: null,
          },
          plate_appearances: [],
          batting_average: game.batting_average
            ? {
                id: 0,
                plate_appearances: 0,
                times_at_bat: 0,
                hit: game.batting_average.hit,
                two_base_hit: 0,
                three_base_hit: 0,
                home_run: game.batting_average.home_run,
                total_bases: 0,
                runs_batted_in: game.batting_average.runs_batted_in,
                run: 0,
                strike_out: 0,
                base_on_balls: 0,
                hit_by_pitch: 0,
                sacrifice_hit: 0,
                sacrifice_fly: 0,
                stealing_base: 0,
                caught_stealing: 0,
                at_bats: game.batting_average.at_bats,
                error: 0,
              }
            : null,
          pitching_result: game.pitching_result
            ? {
                id: 0,
                win: 0,
                loss: 0,
                hold: 0,
                saves: 0,
                innings_pitched: game.pitching_result.innings_pitched,
                number_of_pitches: 0,
                got_to_the_distance: false,
                run_allowed: game.pitching_result.run_allowed,
                earned_run: game.pitching_result.earned_run,
                hits_allowed: 0,
                home_runs_hit: 0,
                strikeouts: game.pitching_result.strikeouts,
                base_on_balls: 0,
                hit_by_pitch: 0,
              }
            : null,
        }),
      },
    });
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.date}>{formatDate(game.date)}</Text>
        <Text style={styles.matchType}>
          {game.match_type === "regular"
            ? "公式戦"
            : game.match_type === "open"
              ? "オープン戦"
              : game.match_type}
        </Text>
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
    </TouchableOpacity>
  );
};

export const RecentGameResults = ({
  results,
  style,
}: RecentGameResultsProps) => {
  const router = useRouter();

  return (
    <View style={style}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>直近の試合結果</Text>
        {results.length > 0 && (
          <TouchableOpacity onPress={() => router.push("/(game-results)")}>
            <Text style={styles.seeAllLink}>すべて見る</Text>
          </TouchableOpacity>
        )}
      </View>
      {results.length === 0 ? (
        <EmptyState title="試合結果がありません" />
      ) : (
        results
          .filter(
            (game, i, arr) => arr.findIndex((g) => g.id === game.id) === i,
          )
          .map((game) => <GameResultCard key={game.id} game={game} />)
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    color: "#F4F4F4",
    fontSize: 18,
    fontWeight: "700",
  },
  seeAllLink: {
    color: "#d08000",
    fontSize: 14,
    fontWeight: "600",
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

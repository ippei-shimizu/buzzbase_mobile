import type { GameResult } from "../../types/gameResult";
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

interface GameResultListItemProps {
  game: GameResult;
  onPress: (game: GameResult) => void;
}

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
};

const matchTypeLabel = (type: string): string => {
  if (type === "regular") return "公式戦";
  if (type === "open") return "オープン戦";
  return type;
};

const HIT_RESULTS = [
  "左安",
  "中安",
  "右安",
  "遊安",
  "投安",
  "一安",
  "二安",
  "三安",
  "左線安",
  "左中安",
  "右中安",
  "右線安",
  "左二",
  "中二",
  "右二",
  "左線二",
  "左中二",
  "右中二",
  "右線二",
  "左三",
  "中三",
  "右三",
  "左線三",
  "左中三",
  "右中三",
  "右線三",
  "左本",
  "中本",
  "右本",
  "左線本",
  "左中本",
  "右中本",
  "右線本",
  "本塁打",
  "安打",
  "二塁打",
  "三塁打",
];

const SACRIFICE_RESULTS = ["犠打", "犠飛", "犠牲"];

const getResultColor = (result: string): string => {
  if (HIT_RESULTS.some((h) => result.includes(h))) return "#f31260";
  if (SACRIFICE_RESULTS.some((s) => result.includes(s))) return "#006fee";
  return "#F4F4F4";
};

export const GameResultListItem = ({
  game,
  onPress,
}: GameResultListItemProps) => {
  const { match_result, batting_average, pitching_result, plate_appearances } =
    game;
  const isWin = match_result.my_team_score > match_result.opponent_team_score;
  const isLoss = match_result.my_team_score < match_result.opponent_team_score;
  const hasBattingDisplay =
    batting_average &&
    (plate_appearances.length > 0 ||
      batting_average.at_bats > 0 ||
      batting_average.hit > 0);

  return (
    <View style={styles.card}>
      {/* ヘッダー: 試合種別 + 日付 + 詳細ボタン */}
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View style={styles.matchTypeBadge}>
            <Text style={styles.matchTypeText}>
              {matchTypeLabel(match_result.match_type)}
            </Text>
          </View>
          <Text style={styles.date}>
            {formatDate(match_result.date_and_time)}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.detailBadge}
          onPress={() => onPress(game)}
        >
          <Text style={styles.detailText}>詳細</Text>
        </TouchableOpacity>
      </View>

      {/* シーズン */}
      {game.season_name && (
        <Text style={styles.seasonText}>シーズン: {game.season_name}</Text>
      )}

      {/* 大会名 */}
      {match_result.tournament_name && (
        <Text style={styles.tournamentText}>
          {match_result.tournament_name}
        </Text>
      )}

      {/* スコア */}
      <View style={styles.scoreRow}>
        <Text
          style={
            isWin
              ? styles.resultWin
              : isLoss
                ? styles.resultLoss
                : styles.resultDraw
          }
        >
          {isWin ? "○" : isLoss ? "✕" : "△"}
        </Text>
        <Text style={styles.score}>
          {match_result.my_team_score} - {match_result.opponent_team_score}
        </Text>
        <Text style={styles.vsText}>vs.</Text>
        <Text style={styles.opponentName}>
          {match_result.opponent_team_name || "不明"}
        </Text>
      </View>

      {/* 打撃成績 */}
      {batting_average &&
        (plate_appearances.length > 0 ||
          batting_average.at_bats > 0 ||
          batting_average.hit > 0) && (
          <View style={styles.statsSection}>
            <Text style={styles.statsLabel}>打撃</Text>
            {plate_appearances.length > 0 ? (
              <Text style={styles.statsValue}>
                {plate_appearances.map((pa, i) => (
                  <Text key={pa.id ?? i}>
                    {i > 0 && <Text style={{ color: "#A1A1AA" }}> </Text>}
                    <Text
                      style={{
                        color: getResultColor(pa.batting_result),
                        fontWeight: "700",
                      }}
                    >
                      {pa.batting_result}
                    </Text>
                  </Text>
                ))}
              </Text>
            ) : (
              <Text style={styles.statsValue}>
                {batting_average.at_bats}打数{batting_average.hit}安打
              </Text>
            )}
          </View>
        )}

      {/* 投手成績 */}
      {pitching_result &&
        (() => {
          const parts = [
            pitching_result.innings_pitched > 0 &&
              `${pitching_result.innings_pitched}回`,
            pitching_result.strikeouts > 0 &&
              `${pitching_result.strikeouts}奪三振`,
            pitching_result.earned_run > 0 &&
              `自責${pitching_result.earned_run}`,
            pitching_result.win > 0 && "勝",
            pitching_result.loss > 0 && "敗",
            pitching_result.saves > 0 && "S",
            pitching_result.hold > 0 && "H",
          ].filter(Boolean);
          if (parts.length === 0) return null;
          return (
            <View
              style={[
                styles.statsSection,
                hasBattingDisplay && { borderTopWidth: 0, paddingTop: 4 },
              ]}
            >
              <Text style={styles.statsLabel}>投球</Text>
              <Text style={styles.statsValue}>{parts.join(" ")}</Text>
            </View>
          );
        })()}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#3A3A3A",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#71717b",
    padding: 12,
    marginBottom: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  matchTypeBadge: {
    backgroundColor: "#27272a",
    borderWidth: 1,
    borderColor: "#d08000",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  matchTypeText: {
    color: "#d08000",
    fontSize: 11,
    fontWeight: "600",
  },
  date: {
    color: "#A1A1AA",
    fontSize: 13,
  },
  detailBadge: {
    borderWidth: 1,
    borderColor: "#d08000",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  detailText: {
    color: "#d08000",
    fontSize: 12,
    fontWeight: "600",
  },
  seasonText: {
    color: "#A1A1AA",
    fontSize: 12,
    marginBottom: 2,
  },
  tournamentText: {
    color: "#A1A1AA",
    fontSize: 12,
    marginBottom: 4,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    marginBottom: 8,
  },
  resultWin: {
    color: "#f31260",
    fontSize: 16,
    fontWeight: "700",
  },
  resultLoss: {
    color: "#006fee",
    fontSize: 16,
    fontWeight: "700",
  },
  resultDraw: {
    color: "#71717A",
    fontSize: 16,
    fontWeight: "700",
  },
  score: {
    color: "#F4F4F4",
    fontSize: 22,
    fontWeight: "700",
  },
  vsText: {
    color: "#A1A1AA",
    fontSize: 13,
    marginLeft: 4,
  },
  opponentName: {
    color: "#F4F4F4",
    fontSize: 16,
    fontWeight: "700",
  },
  statsSection: {
    borderTopWidth: 1,
    borderTopColor: "#71717b",
    paddingTop: 8,
  },
  statsLabel: {
    color: "#71717A",
    fontSize: 12,
    marginBottom: 2,
  },
  statsValue: {
    color: "#F4F4F4",
    fontSize: 14,
    fontWeight: "600",
  },
});

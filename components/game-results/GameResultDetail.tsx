import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { GameResult } from "../../types/gameResult";

interface GameResultDetailProps {
  game: GameResult;
  onDelete?: () => void;
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

const POSITION_MAP: Record<string, string> = {
  "1": "投手",
  "2": "捕手",
  "3": "一塁手",
  "4": "二塁手",
  "5": "三塁手",
  "6": "遊撃手",
  "7": "左翼手",
  "8": "中堅手",
  "9": "右翼手",
  "10": "DH",
};

const positionLabel = (pos: string): string => POSITION_MAP[pos] ?? pos;

const HIT_RESULTS = [
  "左安",
  "中安",
  "右安",
  "遊安",
  "投安",
  "一安",
  "二安",
  "三安",
  "左2",
  "中2",
  "右2",
  "左3",
  "中3",
  "右3",
  "左本",
  "中本",
  "右本",
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

function StatRow({
  items,
}: {
  items: { label: string; value: string | number }[];
}) {
  return (
    <View style={styles.statRow}>
      {items.map((item, i) => (
        <Text key={i} style={styles.statItem}>
          <Text style={styles.statLabel}>{item.label}: </Text>
          <Text style={styles.statValue}>{item.value}</Text>
        </Text>
      ))}
    </View>
  );
}

export const GameResultDetail = ({ game, onDelete }: GameResultDetailProps) => {
  const { match_result, plate_appearances, batting_average, pitching_result } =
    game;
  const isWin = match_result.my_team_score > match_result.opponent_team_score;
  const isLoss = match_result.my_team_score < match_result.opponent_team_score;

  const handleDelete = () => {
    Alert.alert("試合結果の削除", "この試合結果を削除しますか？", [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除",
        style: "destructive",
        onPress: onDelete,
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        {/* ヘッダー */}
        <View style={styles.header}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View style={styles.matchTypeBadge}>
              <Text style={styles.matchTypeText}>
                {matchTypeLabel(match_result.match_type)}
              </Text>
            </View>
            <Text style={styles.dateText}>
              {formatDate(match_result.date_and_time)}
            </Text>
          </View>
        </View>

        {/* シーズン */}
        {game.season_name && (
          <Text style={styles.metaText}>シーズン: {game.season_name}</Text>
        )}

        {/* 大会名 */}
        {match_result.tournament_name && (
          <Text style={styles.tournamentText}>
            {match_result.tournament_name}
          </Text>
        )}

        {/* マイチーム */}
        <Text style={styles.metaText}>マイチーム</Text>
        <Text style={styles.teamName}>無所属</Text>

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

        {/* 打順・守備 */}
        <Text style={styles.positionText}>
          {match_result.batting_order}番{"  "}
          {positionLabel(match_result.defensive_position)}
        </Text>

        {/* 打撃セクション */}
        {batting_average && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>打撃</Text>
            {plate_appearances.length > 0 && (
              <Text style={styles.battingResultText}>
                {plate_appearances
                  .sort((a, b) => a.batter_box_number - b.batter_box_number)
                  .map((pa, i) => (
                    <Text key={`${pa.id}-${i}`}>
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
            )}
            <StatRow
              items={[
                { label: "打点", value: batting_average.runs_batted_in },
                { label: "得点", value: batting_average.run },
                { label: "失策", value: batting_average.error },
              ]}
            />
            <StatRow
              items={[
                { label: "盗塁", value: batting_average.stealing_base },
                { label: "盗塁死", value: batting_average.caught_stealing },
              ]}
            />
          </View>
        )}

        {/* 投手セクション */}
        {pitching_result && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>投手</Text>
            <Text style={styles.pitchingHeadline}>
              {pitching_result.innings_pitched}回{"  "}
              {pitching_result.number_of_pitches}球
            </Text>
            <StatRow
              items={[
                { label: "ホールド", value: pitching_result.hold },
                { label: "セーブ", value: pitching_result.saves },
                { label: "失点", value: pitching_result.run_allowed },
              ]}
            />
            <StatRow
              items={[
                { label: "自責点", value: pitching_result.earned_run },
                { label: "被安打", value: pitching_result.hits_allowed },
                { label: "被本塁打", value: pitching_result.home_runs_hit },
              ]}
            />
            <StatRow
              items={[
                { label: "奪三振", value: pitching_result.strikeouts },
                { label: "四球", value: pitching_result.base_on_balls },
                { label: "死球", value: pitching_result.hit_by_pitch },
              ]}
            />
          </View>
        )}

        {/* メモ */}
        {match_result.memo && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>メモ</Text>
            <Text style={styles.memoText}>{match_result.memo}</Text>
          </View>
        )}
      </View>

      {/* 削除ボタン */}
      {onDelete && (
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={18} color="#EF4444" />
          <Text style={styles.deleteButtonText}>この試合結果を削除</Text>
        </TouchableOpacity>
      )}

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: "#27272a",
    borderRadius: 12,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  matchTypeBadge: {
    backgroundColor: "#2E2E2E",
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
  dateText: {
    color: "#A1A1AA",
    fontSize: 13,
  },
  metaText: {
    color: "#A1A1AA",
    fontSize: 12,
    marginBottom: 2,
  },
  tournamentText: {
    color: "#F4F4F4",
    fontSize: 14,
    marginBottom: 6,
  },
  teamName: {
    color: "#F4F4F4",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    marginBottom: 6,
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
  positionText: {
    color: "#A1A1AA",
    fontSize: 13,
    marginBottom: 4,
  },
  section: {
    borderTopWidth: 1,
    borderTopColor: "#71717b",
    paddingTop: 12,
    marginTop: 12,
  },
  sectionLabel: {
    color: "#71717A",
    fontSize: 12,
    marginBottom: 4,
  },
  battingResultText: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  pitchingHeadline: {
    color: "#F4F4F4",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  statRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginBottom: 4,
  },
  statItem: {
    minWidth: 90,
    fontSize: 13,
  },
  statLabel: {
    color: "#A1A1AA",
  },
  statValue: {
    color: "#F4F4F4",
    fontWeight: "600",
  },
  memoText: {
    color: "#F4F4F4",
    fontSize: 14,
    lineHeight: 20,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#EF4444",
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 16,
  },
  deleteButtonText: {
    color: "#EF4444",
    fontSize: 14,
    fontWeight: "600",
  },
  bottomSpacer: {
    height: 40,
  },
});

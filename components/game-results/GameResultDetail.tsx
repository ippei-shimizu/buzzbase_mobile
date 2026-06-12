import type { GameResult } from "../../types/gameResult";
import type { PlateAppearanceV2 } from "../../types/plateAppearance";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { PlateAppearanceCard } from "@components/game-record/plate-appearance/PlateAppearanceCard";
import { getAppearanceTypeBadgeLabel } from "@constants/appearanceType";
import {
  useDeletePlateAppearance,
  usePlateAppearancesByGame,
} from "@hooks/usePlateAppearances";
import { formatMatchTypeLabel } from "@utils/matchType";

interface GameResultDetailProps {
  game: GameResult;
  onDelete?: () => void;
}

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
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

const positionLabel = (pos: string): string => {
  if (!pos) return "";
  return POSITION_MAP[pos] ?? pos;
};

// 打順表示。空文字／未指定なら表示しない（「なし」を選んだ場合に「番」だけ残らないように）。
// "DH" のように番号でない値はそのまま表示。
const battingOrderLabel = (order: string): string => {
  if (!order) return "";
  if (/^\d+$/.test(order)) return `${order}番`;
  return order;
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
  const router = useRouter();
  const { match_result, batting_average, pitching_result } = game;
  const isWin = match_result.my_team_score > match_result.opponent_team_score;
  const isLoss = match_result.my_team_score < match_result.opponent_team_score;
  // onDelete が渡される＝ページ側で「本人の試合」と判定済みのため、
  // 打席カードの編集・削除導線も同じ条件で出し分ける。
  const isOwner = onDelete !== undefined;

  const { plateAppearances } = usePlateAppearancesByGame(game.game_result_id);
  const { deletePlateAppearance } = useDeletePlateAppearance();

  const sortedPlateAppearances = [...plateAppearances].sort(
    (a, b) => a.batter_box_number - b.batter_box_number,
  );

  const handleEditPlateAppearance = (pa: PlateAppearanceV2) => {
    router.push({
      pathname: "/(game-record)/plate-appearances/[id]/edit",
      params: {
        id: String(pa.id),
        gameResultId: String(game.game_result_id),
      },
    });
  };

  const handleDeletePlateAppearance = (pa: PlateAppearanceV2) => {
    Alert.alert("打席の削除", `第${pa.batter_box_number}打席を削除しますか？`, [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除",
        style: "destructive",
        onPress: async () => {
          try {
            await deletePlateAppearance({
              id: pa.id,
              gameResultId: game.game_result_id,
            });
          } catch {
            Alert.alert("エラー", "打席の削除に失敗しました");
          }
        },
      },
    ]);
  };

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
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
              flex: 1,
            }}
          >
            <View style={styles.matchTypeBadge}>
              <Text style={styles.matchTypeText}>
                {formatMatchTypeLabel(match_result.match_type)}
              </Text>
            </View>
            {(() => {
              const badge = getAppearanceTypeBadgeLabel(
                match_result.appearance_type,
              );
              return badge ? (
                <View style={styles.appearanceBadge}>
                  <Text style={styles.appearanceBadgeText}>{badge}</Text>
                </View>
              ) : null;
            })()}
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
        <Text style={styles.teamName}>
          {match_result.my_team_name || "無所属"}
        </Text>

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

        {/* 打順・守備（未指定のときはセクション全体を非表示にする） */}
        {(() => {
          const orderLabel = battingOrderLabel(match_result.batting_order);
          const posLabel = positionLabel(match_result.defensive_position);
          if (!orderLabel && !posLabel) return null;
          return (
            <Text style={styles.positionText}>
              {orderLabel}
              {orderLabel && posLabel ? "  " : ""}
              {posLabel}
            </Text>
          );
        })()}

        {/* 打撃セクション */}
        {batting_average && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>打撃</Text>
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

      {/* 打席リスト（カード形式） */}
      {sortedPlateAppearances.length > 0 && (
        <View style={styles.plateAppearanceSection}>
          <Text style={styles.plateAppearanceHeader}>打席</Text>
          {sortedPlateAppearances.map((pa) => (
            <PlateAppearanceCard
              key={pa.id}
              plateAppearance={pa}
              onPress={
                isOwner ? () => handleEditPlateAppearance(pa) : undefined
              }
              onLongPress={
                isOwner ? () => handleDeletePlateAppearance(pa) : undefined
              }
            />
          ))}
        </View>
      )}

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
  appearanceBadge: {
    backgroundColor: "#2E2E2E",
    borderWidth: 1,
    borderColor: "#338EF7",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  appearanceBadgeText: {
    color: "#338EF7",
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
  plateAppearanceSection: {
    marginTop: 16,
  },
  plateAppearanceHeader: {
    color: "#A1A1AA",
    fontSize: 13,
    marginBottom: 8,
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

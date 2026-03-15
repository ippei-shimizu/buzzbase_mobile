import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import type { GameResult } from "../../types/gameResult";

interface GameResultDetailProps {
  game: GameResult;
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

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
};

export const GameResultDetail = ({ game }: GameResultDetailProps) => {
  const { match_result, plate_appearances, batting_average, pitching_result } =
    game;
  const isWin = match_result.my_team_score > match_result.opponent_team_score;
  const isLoss = match_result.my_team_score < match_result.opponent_team_score;

  return (
    <ScrollView style={styles.container}>
      <Card title="試合情報">
        <Row label="日付" value={formatDate(match_result.date_and_time)} />
        <Row label="試合種類" value={match_result.match_type} />
        {match_result.tournament_name && (
          <Row label="大会" value={match_result.tournament_name} />
        )}
        <View style={styles.scoreContainer}>
          <Text style={styles.rowLabel}>スコア</Text>
          <Text
            style={[
              styles.scoreValue,
              isWin && styles.scoreWin,
              isLoss && styles.scoreLoss,
            ]}
          >
            {match_result.my_team_score} - {match_result.opponent_team_score}
          </Text>
        </View>
        <Row
          label="対戦相手"
          value={match_result.opponent_team_name || "不明"}
        />
        <Row label="打順" value={match_result.batting_order} />
        <Row label="守備位置" value={match_result.defensive_position} />
        {match_result.memo && <Row label="メモ" value={match_result.memo} />}
      </Card>

      {plate_appearances.length > 0 && (
        <Card title="打席結果">
          {plate_appearances
            .sort((a, b) => a.batter_box_number - b.batter_box_number)
            .map((pa) => (
              <Row
                key={pa.id}
                label={`第${pa.batter_box_number}打席`}
                value={pa.batting_result}
              />
            ))}
        </Card>
      )}

      {batting_average && (
        <Card title="打撃成績">
          <Row label="打席" value={batting_average.plate_appearances} />
          <Row label="打数" value={batting_average.times_at_bat} />
          <Row label="安打" value={batting_average.hit} />
          <Row label="二塁打" value={batting_average.two_base_hit} />
          <Row label="三塁打" value={batting_average.three_base_hit} />
          <Row label="本塁打" value={batting_average.home_run} />
          <Row label="塁打" value={batting_average.total_bases} />
          <Row label="打点" value={batting_average.runs_batted_in} />
          <Row label="得点" value={batting_average.run} />
          <Row label="三振" value={batting_average.strike_out} />
          <Row label="四球" value={batting_average.base_on_balls} />
          <Row label="死球" value={batting_average.hit_by_pitch} />
          <Row label="犠打" value={batting_average.sacrifice_hit} />
          <Row label="犠飛" value={batting_average.sacrifice_fly} />
          <Row label="盗塁" value={batting_average.stealing_base} />
          <Row label="盗塁死" value={batting_average.caught_stealing} />
          <Row label="失策" value={batting_average.error} />
        </Card>
      )}

      {pitching_result && (
        <Card title="投手成績">
          <Row
            label="勝敗"
            value={
              pitching_result.win > 0
                ? "勝"
                : pitching_result.loss > 0
                  ? "負"
                  : "なし"
            }
          />
          <Row label="ホールド" value={pitching_result.hold} />
          <Row label="セーブ" value={pitching_result.saves} />
          <Row label="投球回" value={pitching_result.innings_pitched} />
          <Row
            label="完投"
            value={pitching_result.got_to_the_distance ? "○" : "×"}
          />
          <Row label="投球数" value={pitching_result.number_of_pitches} />
          <Row label="失点" value={pitching_result.run_allowed} />
          <Row label="自責点" value={pitching_result.earned_run} />
          <Row label="被安打" value={pitching_result.hits_allowed} />
          <Row label="被本塁打" value={pitching_result.home_runs_hit} />
          <Row label="奪三振" value={pitching_result.strikeouts} />
          <Row label="与四球" value={pitching_result.base_on_balls} />
          <Row label="与死球" value={pitching_result.hit_by_pitch} />
        </Card>
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
  scoreContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  scoreValue: {
    color: "#F4F4F4",
    fontSize: 16,
    fontWeight: "700",
  },
  scoreWin: {
    color: "#d08000",
  },
  scoreLoss: {
    color: "#A1A1AA",
  },
  bottomSpacer: {
    height: 40,
  },
});

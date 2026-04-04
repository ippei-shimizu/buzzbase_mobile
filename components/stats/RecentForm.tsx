import type { RecentFormGame } from "../../types/stats";
import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface RecentFormProps {
  games: RecentFormGame[];
}

const RESULT_DISPLAY: Record<string, { mark: string; color: string }> = {
  win: { mark: "○", color: "#f31260" },
  loss: { mark: "×", color: "#006fee" },
  draw: { mark: "△", color: "#6b7280" },
};

export const RecentForm = ({ games }: RecentFormProps) => {
  if (games.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>直近の試合</Text>
      <View style={styles.row}>
        {games.map((g, i) => {
          const display = RESULT_DISPLAY[g.result] ?? RESULT_DISPLAY.draw;
          return (
            <View key={i} style={styles.game}>
              <Text style={[styles.mark, { color: display.color }]}>
                {display.mark}
              </Text>
              <Text style={styles.score}>
                {g.my_score}-{g.opponent_score}
              </Text>
              <Text style={styles.opponent} numberOfLines={1}>
                {g.opponent}
              </Text>
              <Text style={styles.date}>{g.date}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#F4F4F4",
    marginBottom: 12,
  },
  row: { flexDirection: "row", gap: 6 },
  game: {
    flex: 1,
    backgroundColor: "#3A3A3A",
    borderRadius: 12,
    padding: 8,
    alignItems: "center",
  },
  mark: { fontSize: 20, fontWeight: "700" },
  score: { fontSize: 14, fontWeight: "600", color: "#F4F4F4", marginTop: 2 },
  opponent: {
    fontSize: 11,
    color: "#A1A1AA",
    marginTop: 2,
    textAlign: "center",
  },
  date: { fontSize: 11, color: "#A1A1AA", marginTop: 1 },
});

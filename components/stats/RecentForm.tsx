import type { RecentFormGame } from "../../types/stats";
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { formatMatchTypeLabel } from "../../utils/matchType";

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
      <View style={styles.list}>
        {games.map((g) => {
          const display = RESULT_DISPLAY[g.result] ?? RESULT_DISPLAY.draw;
          const typeLabel = formatMatchTypeLabel(g.match_type);
          return (
            <View key={g.game_result_id} style={styles.game}>
              {typeLabel ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{typeLabel}</Text>
                </View>
              ) : (
                <View style={styles.badgePlaceholder} />
              )}
              <Text style={styles.date}>{g.date}</Text>
              <Text style={[styles.mark, { color: display.color }]}>
                {display.mark}
              </Text>
              <Text style={styles.score}>
                {g.my_score}-{g.opponent_score}
              </Text>
              <Text style={styles.opponent} numberOfLines={1}>
                vs {g.opponent}
              </Text>
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
  list: { gap: 8 },
  game: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3A3A3A",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 12,
  },
  mark: {
    fontSize: 20,
    fontWeight: "700",
    width: 24,
    textAlign: "center",
    marginLeft: -6,
  },
  date: { fontSize: 13, color: "#A1A1AA" },
  badge: {
    width: 72,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: "#4A4A4A",
    alignItems: "center",
    overflow: "hidden",
  },
  badgePlaceholder: { width: 72 },
  badgeText: {
    fontSize: 12,
    color: "#A1A1AA",
  },
  score: {
    fontSize: 14,
    fontWeight: "600",
    color: "#F4F4F4",
    marginLeft: -6,
  },
  opponent: {
    flex: 1,
    fontSize: 13,
    color: "#F4F4F4",
    marginLeft: -4,
  },
});

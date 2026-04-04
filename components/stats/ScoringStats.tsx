import type { Scoring } from "../../types/stats";
import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface ScoringStatsProps {
  scoring: Scoring;
}

export const ScoringStats = ({ scoring }: ScoringStatsProps) => {
  const diffColor =
    scoring.run_differential > 0
      ? "#f31260"
      : scoring.run_differential < 0
        ? "#006fee"
        : "#6b7280";
  const diffPrefix = scoring.run_differential > 0 ? "+" : "";

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>得失点</Text>
      <View style={styles.cards}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>総得点</Text>
          <Text style={[styles.cardValue, { color: "#f31260" }]}>
            {scoring.runs_for}
          </Text>
          <Text style={styles.avgText}>平均 {scoring.avg_runs_for}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>総失点</Text>
          <Text style={[styles.cardValue, { color: "#006fee" }]}>
            {scoring.runs_against}
          </Text>
          <Text style={styles.avgText}>平均 {scoring.avg_runs_against}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>得失点差</Text>
          <Text style={[styles.cardValue, { color: diffColor }]}>
            {diffPrefix}
            {scoring.run_differential}
          </Text>
        </View>
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
  cards: { flexDirection: "row", gap: 8 },
  card: {
    flex: 1,
    backgroundColor: "#3A3A3A",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  cardLabel: { fontSize: 14, color: "#A1A1AA" },
  cardValue: { fontSize: 20, fontWeight: "700" },
  avgText: { fontSize: 13, color: "#A1A1AA", marginTop: 2 },
});

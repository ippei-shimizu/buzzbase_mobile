// mobile/components/stats/WinLossCards.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { WinLossSummary } from "../../types/stats";

interface WinLossCardsProps {
  summary: WinLossSummary;
}

export const WinLossCards = ({ summary }: WinLossCardsProps) => {
  const total = summary.wins + summary.losses + summary.draws;
  const winPct = total > 0 ? (summary.wins / total) * 100 : 0;
  const lossPct = total > 0 ? (summary.losses / total) * 100 : 0;
  const drawPct = total > 0 ? (summary.draws / total) * 100 : 0;

  return (
    <View>
      <View style={styles.cards}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>勝利</Text>
          <Text style={[styles.cardValue, { color: "#ef4444" }]}>{summary.wins}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>敗北</Text>
          <Text style={[styles.cardValue, { color: "#3b82f6" }]}>{summary.losses}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>引分</Text>
          <Text style={[styles.cardValue, { color: "#6b7280" }]}>{summary.draws}</Text>
        </View>
      </View>
      <View style={styles.rateRow}>
        <Text style={styles.rateLabel}>勝率</Text>
        <Text style={styles.rateValue}>
          {summary.win_rate.toFixed(3).replace(/^0/, "")}
        </Text>
      </View>
      <View style={styles.bar}>
        {winPct > 0 && <View style={[styles.barSegment, { width: `${winPct}%`, backgroundColor: "#ef4444" }]} />}
        {lossPct > 0 && <View style={[styles.barSegment, { width: `${lossPct}%`, backgroundColor: "#3b82f6" }]} />}
        {drawPct > 0 && <View style={[styles.barSegment, { width: `${drawPct}%`, backgroundColor: "#6b7280" }]} />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cards: { flexDirection: "row", gap: 8, marginBottom: 12 },
  card: {
    flex: 1, backgroundColor: "#1a2332", borderRadius: 8,
    padding: 10, alignItems: "center",
  },
  cardLabel: { fontSize: 10, color: "#888" },
  cardValue: { fontSize: 22, fontWeight: "700" },
  rateRow: {
    flexDirection: "row", justifyContent: "space-between",
    marginBottom: 4,
  },
  rateLabel: { fontSize: 11, color: "#888" },
  rateValue: { fontSize: 11, color: "#f59e0b", fontWeight: "700" },
  bar: {
    height: 6, backgroundColor: "#222", borderRadius: 3,
    flexDirection: "row", overflow: "hidden", marginBottom: 16,
  },
  barSegment: { height: "100%" },
});

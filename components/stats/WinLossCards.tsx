import type { WinLossSummary } from "../../types/stats";
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { formatRate } from "@utils/formatStats";

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
          <Text style={[styles.cardValue, { color: "#f31260" }]}>
            {summary.wins}
          </Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>敗北</Text>
          <Text style={[styles.cardValue, { color: "#006fee" }]}>
            {summary.losses}
          </Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>引分</Text>
          <Text style={[styles.cardValue, { color: "#6b7280" }]}>
            {summary.draws}
          </Text>
        </View>
      </View>
      <View style={styles.rateRow}>
        <Text style={styles.rateLabel}>{total}試合 / 勝率</Text>
        <Text style={styles.rateValue}>{formatRate(summary.win_rate)}</Text>
      </View>
      <View style={styles.bar}>
        {winPct > 0 && (
          <View
            style={[
              styles.barSegment,
              { width: `${winPct}%`, backgroundColor: "#f31260" },
            ]}
          />
        )}
        {lossPct > 0 && (
          <View
            style={[
              styles.barSegment,
              { width: `${lossPct}%`, backgroundColor: "#006fee" },
            ]}
          />
        )}
        {drawPct > 0 && (
          <View
            style={[
              styles.barSegment,
              { width: `${drawPct}%`, backgroundColor: "#6b7280" },
            ]}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cards: { flexDirection: "row", gap: 8, marginBottom: 12 },
  card: {
    flex: 1,
    backgroundColor: "#3A3A3A",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  cardLabel: { fontSize: 14, color: "#A1A1AA" },
  cardValue: { fontSize: 22, fontWeight: "700" },
  rateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  rateLabel: { fontSize: 14, color: "#A1A1AA" },
  rateValue: { fontSize: 14, color: "#d08000", fontWeight: "700" },
  bar: {
    height: 6,
    backgroundColor: "#424242",
    borderRadius: 3,
    flexDirection: "row",
    overflow: "hidden",
    marginBottom: 16,
  },
  barSegment: { height: "100%" },
});

// mobile/components/stats/MatchTypeBreakdown.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { MatchTypeRecord } from "../../types/stats";

interface MatchTypeBreakdownProps {
  breakdown: MatchTypeRecord[];
}

export const MatchTypeBreakdown = ({ breakdown }: MatchTypeBreakdownProps) => (
  <View>
    <Text style={styles.sectionTitle}>試合種別</Text>
    <View style={styles.row}>
      {breakdown.map((mt) => (
        <View
          key={mt.match_type}
          style={[
            styles.card,
            { borderLeftColor: mt.match_type === "公式戦" ? "#f59e0b" : "#6b7280" },
          ]}
        >
          <Text
            style={[
              styles.typeLabel,
              { color: mt.match_type === "公式戦" ? "#f59e0b" : "#aaa" },
            ]}
          >
            {mt.match_type}
          </Text>
          <Text style={styles.totalText}>{mt.total}試合</Text>
          <Text style={styles.detailText}>
            {mt.wins}勝 {mt.losses}敗 {mt.draws}分 ({mt.win_rate.toFixed(3).replace(/^0/, "")})
          </Text>
        </View>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 13, fontWeight: "600", color: "#ccc", marginBottom: 8 },
  row: { flexDirection: "row", gap: 8, marginBottom: 16 },
  card: {
    flex: 1, backgroundColor: "#111", borderRadius: 8,
    padding: 12, borderLeftWidth: 3,
  },
  typeLabel: { fontSize: 11, fontWeight: "600", marginBottom: 4 },
  totalText: { fontSize: 12, color: "#ccc" },
  detailText: { fontSize: 11, color: "#888", marginTop: 2 },
});

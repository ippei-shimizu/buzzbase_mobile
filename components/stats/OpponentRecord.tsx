// mobile/components/stats/OpponentRecord.tsx
import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import type { OpponentRecord as OpponentRecordType } from "../../types/stats";

interface OpponentRecordProps {
  records: OpponentRecordType[];
}

const INITIAL_SHOW = 3;

export const OpponentRecordList = ({ records }: OpponentRecordProps) => {
  const [expanded, setExpanded] = useState(false);
  const displayed = expanded ? records : records.slice(0, INITIAL_SHOW);

  return (
    <View>
      <Text style={styles.sectionTitle}>対戦相手別</Text>
      <View style={styles.list}>
        {displayed.map((r) => (
          <View key={r.team_name} style={styles.item}>
            <Text style={styles.teamName} numberOfLines={1}>{r.team_name}</Text>
            <Text style={[styles.stat, { color: "#ef4444" }]}>{r.wins}勝</Text>
            <Text style={[styles.stat, { color: "#3b82f6" }]}>{r.losses}敗</Text>
            <Text style={[styles.stat, { color: "#6b7280" }]}>{r.draws}分</Text>
          </View>
        ))}
      </View>
      {records.length > INITIAL_SHOW && (
        <TouchableOpacity onPress={() => setExpanded(!expanded)}>
          <Text style={styles.toggle}>
            {expanded ? "閉じる ▲" : "すべて表示 ▼"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 13, fontWeight: "600", color: "#ccc", marginBottom: 8 },
  list: { gap: 6 },
  item: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#111", borderRadius: 8,
    paddingVertical: 10, paddingHorizontal: 12,
  },
  teamName: { flex: 1, color: "#ccc", fontSize: 12 },
  stat: { fontWeight: "700", fontSize: 12, marginLeft: 12 },
  toggle: { textAlign: "center", color: "#555", fontSize: 12, paddingVertical: 8 },
});

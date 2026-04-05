import type { OpponentRecord as OpponentRecordType } from "../../types/stats";
import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { formatRate } from "@utils/formatStats";

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
        {displayed.map((r) => {
          const winRate =
            r.wins + r.losses > 0
              ? formatRate(r.wins / (r.wins + r.losses))
              : ".000";
          return (
            <View key={r.team_name} style={styles.item}>
              <Text style={styles.teamName} numberOfLines={1}>
                {r.team_name}
              </Text>
              <Text style={[styles.stat, { color: "#f31260" }]}>
                {r.wins}勝
              </Text>
              <Text style={[styles.stat, { color: "#006fee" }]}>
                {r.losses}敗
              </Text>
              <Text style={[styles.stat, { color: "#6b7280" }]}>
                {r.draws}分
              </Text>
              <Text style={styles.winRate}>{winRate}</Text>
            </View>
          );
        })}
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#F4F4F4",
    marginBottom: 12,
  },
  list: { gap: 6 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3A3A3A",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  teamName: { flex: 1, color: "#F4F4F4", fontSize: 14 },
  stat: { fontWeight: "700", fontSize: 14, marginLeft: 12 },
  winRate: {
    color: "#d08000",
    fontWeight: "700",
    fontSize: 14,
    marginLeft: 12,
    minWidth: 36,
    textAlign: "right" as const,
  },
  toggle: {
    textAlign: "center",
    color: "#71717A",
    fontSize: 12,
    paddingVertical: 8,
  },
});

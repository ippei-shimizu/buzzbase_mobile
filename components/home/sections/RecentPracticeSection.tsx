import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { usePracticeLogs } from "@hooks/usePracticeLogs";
import { SectionCard, SectionPlaceholder } from "./SectionCard";

/** 最近の練習タイムライン（量ログ）。ノート同居は #325 で差し込む。 */
export function RecentPracticeSection() {
  const { logs } = usePracticeLogs();
  const recent = logs.slice(0, 5);

  return (
    <SectionCard title="最近の練習">
      {recent.length === 0 ? (
        <SectionPlaceholder message="記録した練習がここに新しい順で並びます" />
      ) : (
        recent.map((log) => (
          <View key={log.id} style={styles.row}>
            <Text style={styles.date}>{log.logged_on.slice(5)}</Text>
            <Text style={styles.name}>
              {log.menu_name}
              {log.amount != null
                ? ` ${log.amount}${log.unit_label ?? ""}`
                : ""}
            </Text>
          </View>
        ))
      )}
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 6,
  },
  date: { color: "#A1A1AA", fontSize: 12, width: 44 },
  name: { color: "#F4F4F4", fontSize: 14, flex: 1 },
});

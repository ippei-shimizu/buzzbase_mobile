import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useNotes } from "@hooks/useNotes";
import { usePracticeLogs } from "@hooks/usePracticeLogs";
import { SectionCard, SectionPlaceholder } from "./SectionCard";

/** 最近の練習タイムライン（量ログ＋紐付いたノートを同居表示）。 */
export function RecentPracticeSection() {
  const { logs } = usePracticeLogs();
  const { notes } = useNotes();
  const recent = logs.slice(0, 5);

  // 練習ログIDごとに紐付いたノートのプレビューを引けるようにする。
  const noteByLog = new Map(
    notes
      .filter((note) => note.practice_log_id != null)
      .map((note) => [note.practice_log_id, note.memo_preview]),
  );

  return (
    <SectionCard title="最近の練習">
      {recent.length === 0 ? (
        <SectionPlaceholder message="記録した練習がここに新しい順で並びます" />
      ) : (
        recent.map((log) => (
          <View key={log.id} style={styles.row}>
            <View style={styles.logLine}>
              <Text style={styles.date}>{log.logged_on.slice(5)}</Text>
              <Text style={styles.name}>
                {log.menu_name}
                {log.amount != null
                  ? ` ${log.amount}${log.unit_label ?? ""}`
                  : ""}
              </Text>
            </View>
            {noteByLog.get(log.id) ? (
              <View style={styles.noteRow}>
                <Ionicons name="pencil" size={12} color="#A1A1AA" />
                <Text style={styles.note} numberOfLines={2}>
                  {noteByLog.get(log.id)}
                </Text>
              </View>
            ) : null}
          </View>
        ))
      )}
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  row: { paddingVertical: 6 },
  logLine: { flexDirection: "row", alignItems: "center", gap: 10 },
  date: { color: "#A1A1AA", fontSize: 12, width: 44 },
  name: { color: "#F4F4F4", fontSize: 14, flex: 1 },
  noteRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 4,
    marginTop: 4,
    marginLeft: 54,
  },
  note: { color: "#A1A1AA", fontSize: 12, flex: 1 },
});

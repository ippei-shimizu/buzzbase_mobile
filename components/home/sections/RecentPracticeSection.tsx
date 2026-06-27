import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNotes } from "@hooks/useNotes";
import { usePracticeSessions } from "@hooks/usePracticeSessions";
import { SectionCard, SectionPlaceholder } from "./SectionCard";

/** 最近の練習タイムライン（日付ごとに当日のメニューと紐付いたノートを同居表示）。 */
export function RecentPracticeSection() {
  const router = useRouter();
  const { sessions } = usePracticeSessions();
  const { notes } = useNotes();
  const recent = sessions.slice(0, 5);

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
        recent.map((session) => (
          <View key={session.id} style={styles.day}>
            <Text style={styles.date}>{session.logged_on.slice(5)}</Text>
            {session.practice_logs.map((log) => (
              <View key={log.id} style={styles.logRow}>
                <Text style={styles.name}>
                  {log.menu_name}
                  {log.amount != null
                    ? ` ${log.amount}${log.unit_label ?? ""}`
                    : ""}
                </Text>
                {noteByLog.get(log.id) ? (
                  <View style={styles.noteRow}>
                    <Ionicons name="pencil" size={12} color="#A1A1AA" />
                    <Text style={styles.note} numberOfLines={2}>
                      {noteByLog.get(log.id)}
                    </Text>
                  </View>
                ) : null}
              </View>
            ))}
          </View>
        ))
      )}
      <TouchableOpacity
        style={styles.moreRow}
        onPress={() => router.push("/(records)")}
      >
        <Text style={styles.moreText}>練習記録・野球ノートの一覧を見る</Text>
        <Ionicons name="chevron-forward" size={16} color="#d08000" />
      </TouchableOpacity>
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  day: {
    paddingVertical: 8,
    borderBottomColor: "#3A3A3A",
    borderBottomWidth: 1,
  },
  date: { color: "#A1A1AA", fontSize: 12, fontWeight: "700", marginBottom: 4 },
  logRow: { paddingVertical: 2 },
  name: { color: "#F4F4F4", fontSize: 14 },
  noteRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 4,
    marginTop: 2,
    marginLeft: 12,
  },
  note: { color: "#A1A1AA", fontSize: 12, flex: 1 },
  moreRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingTop: 12,
  },
  moreText: { color: "#d08000", fontSize: 13, fontWeight: "600" },
});

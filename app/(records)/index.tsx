import type { NoteV2 } from "../../types/note";
import type { PracticeSession } from "../../types/practice";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { UnderlineTabBar } from "@components/ui/UnderlineTabBar";
import { useNotes } from "@hooks/useNotes";
import { usePracticeSessions } from "@hooks/usePracticeSessions";

const SEGMENTS = ["練習記録", "野球ノート"];

function PracticeList() {
  const router = useRouter();
  const { sessions, isLoading } = usePracticeSessions();

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#d08000" />
      </View>
    );
  }
  if (sessions.length === 0) {
    return <Text style={styles.empty}>まだ練習記録がありません</Text>;
  }

  const summary = (session: PracticeSession): string =>
    session.practice_logs
      .map(
        (log) =>
          `${log.menu_name}${log.amount != null ? ` ${log.amount}${log.unit_label ?? ""}` : ""}`,
      )
      .join(" ・ ");

  return (
    <>
      {sessions.map((session) => (
        <TouchableOpacity
          key={session.id}
          style={styles.card}
          onPress={() =>
            router.push({
              pathname: "/(practice-record)/daily",
              params: { date: session.logged_on },
            })
          }
        >
          <View style={styles.cardHead}>
            <Text style={styles.date}>{session.logged_on}</Text>
            <Ionicons name="chevron-forward" size={16} color="#A1A1AA" />
          </View>
          <Text style={styles.summary} numberOfLines={2}>
            {summary(session) || "メニューなし"}
          </Text>
          {session.memo ? (
            <Text style={styles.memo} numberOfLines={1}>
              {session.memo}
            </Text>
          ) : null}
        </TouchableOpacity>
      ))}
    </>
  );
}

function NoteList() {
  const { notes, isLoading } = useNotes();

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#d08000" />
      </View>
    );
  }
  if (notes.length === 0) {
    return <Text style={styles.empty}>まだ野球ノートがありません</Text>;
  }

  const linkLabel = (note: NoteV2): string | null => {
    if (note.practice_session_id != null || note.practice_log_id != null) {
      return "練習に紐付け";
    }
    if (note.game_result_id != null) return "試合に紐付け";
    return null;
  };

  return (
    <>
      {notes.map((note) => (
        <View key={note.id} style={styles.card}>
          <View style={styles.cardHead}>
            <Text style={styles.date}>{note.date}</Text>
            {linkLabel(note) ? (
              <View style={styles.linkBadge}>
                <Ionicons name="link-outline" size={12} color="#A1A1AA" />
                <Text style={styles.linkBadgeText}>{linkLabel(note)}</Text>
              </View>
            ) : null}
          </View>
          {note.title ? (
            <Text style={styles.noteTitle}>{note.title}</Text>
          ) : null}
          <Text style={styles.summary} numberOfLines={2}>
            {note.memo_preview}
          </Text>
        </View>
      ))}
    </>
  );
}

export default function RecordsScreen() {
  const [segment, setSegment] = useState(0);

  return (
    <View style={styles.container}>
      <UnderlineTabBar
        options={SEGMENTS}
        selectedIndex={segment}
        onSelect={setSegment}
      />
      <ScrollView contentContainerStyle={styles.content}>
        {segment === 0 ? <PracticeList /> : <NoteList />}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#2E2E2E" },
  content: { padding: 16, paddingBottom: 40 },
  centered: { paddingVertical: 48, alignItems: "center" },
  empty: { color: "#A1A1AA", fontSize: 14, textAlign: "center", marginTop: 40 },
  card: {
    backgroundColor: "#3A3A3A",
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },
  cardHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  date: { color: "#A1A1AA", fontSize: 12, fontWeight: "700" },
  summary: { color: "#F4F4F4", fontSize: 14 },
  memo: { color: "#A1A1AA", fontSize: 12, marginTop: 4 },
  noteTitle: {
    color: "#F4F4F4",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  linkBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
  linkBadgeText: { color: "#A1A1AA", fontSize: 11 },
});

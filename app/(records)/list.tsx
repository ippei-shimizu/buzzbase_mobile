import type { NoteV2 } from "../../types/note";
import type { PracticeSession } from "../../types/practice";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
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
import { formatAmount } from "@utils/formatAmount";

const SEGMENTS = ["練習記録", "野球ノート"];

function NewRecordButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.newButton} onPress={onPress}>
      <Ionicons name="add" size={18} color="#FFFFFF" />
      <Text style={styles.newButtonText}>{label}</Text>
    </TouchableOpacity>
  );
}

function PracticeList() {
  const router = useRouter();
  const { sessions, isLoading } = usePracticeSessions();

  const summary = (session: PracticeSession): string =>
    session.practice_logs
      .map(
        (log) =>
          `${log.menu_name}${log.amount != null ? ` ${formatAmount(log.amount)}${log.unit_label ?? ""}` : ""}`,
      )
      .join(" ・ ");

  return (
    <>
      <NewRecordButton
        label="練習を記録"
        onPress={() => router.push("/(practice-record)/daily")}
      />
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#d08000" />
        </View>
      ) : sessions.length === 0 ? (
        <Text style={styles.empty}>まだ練習記録がありません</Text>
      ) : (
        sessions.map((session) => (
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
          </TouchableOpacity>
        ))
      )}
    </>
  );
}

function NoteList() {
  const router = useRouter();
  const { notes, isLoading } = useNotes();

  const linkLabel = (note: NoteV2): string | null => {
    if (note.practice_session_id != null || note.practice_log_id != null) {
      return "練習に紐付け";
    }
    if (note.game_result_id != null) return "試合に紐付け";
    return null;
  };

  return (
    <>
      <NewRecordButton
        label="野球ノートを記録"
        onPress={() => router.push("/(note)/new")}
      />
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#d08000" />
        </View>
      ) : notes.length === 0 ? (
        <Text style={styles.empty}>まだ野球ノートがありません</Text>
      ) : (
        notes.map((note) => (
          <TouchableOpacity
            key={note.id}
            style={styles.card}
            onPress={() => router.push(`/(note)/${note.id}`)}
          >
            <View style={styles.cardHead}>
              <Text style={styles.date}>{note.date}</Text>
              {linkLabel(note) ? (
                <View style={styles.linkBadge}>
                  <Ionicons name="link-outline" size={12} color="#A1A1AA" />
                  <Text style={styles.linkBadgeText}>{linkLabel(note)}</Text>
                </View>
              ) : (
                <Ionicons name="chevron-forward" size={16} color="#A1A1AA" />
              )}
            </View>
            {note.title ? (
              <Text style={styles.noteTitle}>{note.title}</Text>
            ) : null}
            <Text style={styles.summary} numberOfLines={2}>
              {note.memo_preview}
            </Text>
          </TouchableOpacity>
        ))
      )}
    </>
  );
}

export default function RecordsScreen() {
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const [segment, setSegment] = useState(tab === "note" ? 1 : 0);

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
  newButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#d08000",
    borderRadius: 10,
    paddingVertical: 14,
    marginBottom: 16,
  },
  newButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
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
  noteTitle: {
    color: "#F4F4F4",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  linkBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
  linkBadgeText: { color: "#A1A1AA", fontSize: 11 },
});

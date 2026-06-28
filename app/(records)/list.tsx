import type { NoteV2 } from "../../types/note";
import type { PracticeLog, PracticeSession } from "../../types/practice";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { UnderlineTabBar } from "@components/ui/UnderlineTabBar";
import { formatPracticeValue } from "@constants/practice";
import { useNotes } from "@hooks/useNotes";
import { usePracticeSessions } from "@hooks/usePracticeSessions";

const SEGMENTS = ["練習記録", "野球ノート"];
const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

const parseDate = (iso: string): Date => {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
};
const formatJaDate = (iso: string): string => {
  const date = parseDate(iso);
  return `${date.getMonth() + 1}/${date.getDate()}(${WEEKDAYS[date.getDay()]})`;
};
const monthKey = (iso: string): string => iso.slice(0, 7);
const monthLabel = (iso: string): string => {
  const [year, month] = iso.split("-").map(Number);
  return year === new Date().getFullYear()
    ? `${month}月`
    : `${year}年${month}月`;
};

// 月見出しを挟みながら、日付降順のリストを描画用に並べる。
function withMonthHeaders<T extends { id: number }>(
  items: T[],
  dateOf: (item: T) => string,
): ({ header: string; key: string } | { item: T; key: string })[] {
  const rows: ({ header: string; key: string } | { item: T; key: string })[] =
    [];
  let last: string | null = null;
  items.forEach((item) => {
    const key = monthKey(dateOf(item));
    if (key !== last) {
      rows.push({ header: monthLabel(dateOf(item)), key: `h-${key}` });
      last = key;
    }
    rows.push({ item, key: `i-${item.id}` });
  });
  return rows;
}

const LEVEL_FACE: ({
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
} | null)[] = [
  null,
  { icon: "sad", color: "#ef4444" },
  { icon: "sad-outline", color: "#f59e0b" },
  { icon: "happy-outline", color: "#84cc16" },
  { icon: "happy", color: "#22c55e" },
];

const menuIcon = (log: PracticeLog): keyof typeof Ionicons.glyphMap => {
  if (log.source === "shadow_swing") return "baseball-outline";
  if (log.weight != null) return "barbell-outline";
  return "fitness-outline";
};

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

function MonthHeader({ label }: { label: string }) {
  return <Text style={styles.monthHeader}>{label}</Text>;
}

function PracticeCard({
  session,
  hasNote,
  onPress,
}: {
  session: PracticeSession;
  hasNote: boolean;
  onPress: () => void;
}) {
  const logs = session.practice_logs;
  const condition = session.condition;
  const faceLevel = condition?.physical_level ?? condition?.fatigue_level;
  const face = faceLevel ? LEVEL_FACE[faceLevel] : null;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardHead}>
        <Text style={styles.dateBig}>{formatJaDate(session.logged_on)}</Text>
        <View style={styles.headRight}>
          {logs.length > 0 ? (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{logs.length}メニュー</Text>
            </View>
          ) : null}
          {face ? (
            <Ionicons name={face.icon} size={20} color={face.color} />
          ) : null}
        </View>
      </View>

      {logs.length === 0 ? (
        <Text style={styles.muted}>メニューなし</Text>
      ) : (
        <View style={styles.menuList}>
          {logs.map((log) => (
            <View key={log.id} style={styles.menuRow}>
              <Ionicons name={menuIcon(log)} size={15} color="#A1A1AA" />
              <Text style={styles.menuName} numberOfLines={1}>
                {log.menu_name}
              </Text>
              <Text style={styles.menuValue}>{formatPracticeValue(log)}</Text>
            </View>
          ))}
        </View>
      )}

      {hasNote ? (
        <View style={styles.noteTag}>
          <Ionicons name="document-text-outline" size={13} color="#d08000" />
          <Text style={styles.noteTagText}>ノートあり</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

function PracticeList() {
  const router = useRouter();
  const { sessions, isLoading } = usePracticeSessions();
  const { notes } = useNotes();

  const noteSessionIds = new Set(
    notes
      .map((note) => note.practice_session_id)
      .filter((id): id is number => id != null),
  );

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
        withMonthHeaders(sessions, (session) => session.logged_on).map((row) =>
          "header" in row ? (
            <MonthHeader key={row.key} label={row.header} />
          ) : (
            <PracticeCard
              key={row.key}
              session={row.item}
              hasNote={noteSessionIds.has(row.item.id)}
              onPress={() =>
                router.push({
                  pathname: "/(practice-record)/daily",
                  params: { date: row.item.logged_on },
                })
              }
            />
          ),
        )
      )}
    </>
  );
}

function NoteLinkChip({ note }: { note: NoteV2 }) {
  if (note.practice_session_id != null || note.practice_log_id != null) {
    return (
      <View style={[styles.linkChip, styles.practiceChip]}>
        <Ionicons name="barbell-outline" size={12} color="#d08000" />
        <Text style={styles.practiceChipText}>練習に紐付け</Text>
      </View>
    );
  }
  if (note.game_result_id != null) {
    return (
      <View style={[styles.linkChip, styles.gameChip]}>
        <Ionicons name="baseball-outline" size={12} color="#93c5fd" />
        <Text style={styles.gameChipText}>試合に紐付け</Text>
      </View>
    );
  }
  return null;
}

function NoteCard({ note, onPress }: { note: NoteV2; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardHead}>
        <Text style={styles.dateBig}>{formatJaDate(note.date)}</Text>
        <Ionicons name="chevron-forward" size={16} color="#A1A1AA" />
      </View>
      <Text style={styles.noteTitle}>{note.title || "無題のノート"}</Text>
      {note.memo_preview ? (
        <Text style={styles.preview} numberOfLines={2}>
          {note.memo_preview}
        </Text>
      ) : null}
      <NoteLinkChip note={note} />
    </TouchableOpacity>
  );
}

function NoteList() {
  const router = useRouter();
  const { notes, isLoading } = useNotes();

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
        withMonthHeaders(notes, (note) => note.date).map((row) =>
          "header" in row ? (
            <MonthHeader key={row.key} label={row.header} />
          ) : (
            <NoteCard
              key={row.key}
              note={row.item}
              onPress={() => router.push(`/(note)/${row.item.id}`)}
            />
          ),
        )
      )}
    </>
  );
}

export default function RecordsScreen() {
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const [segment, setSegment] = React.useState(tab === "note" ? 1 : 0);

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
  monthHeader: {
    color: "#A1A1AA",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
    marginTop: 4,
  },
  card: {
    backgroundColor: "#3A3A3A",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  cardHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateBig: { color: "#F4F4F4", fontSize: 15, fontWeight: "700" },
  headRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  countBadge: {
    backgroundColor: "#2E2E2E",
    borderRadius: 10,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  countBadgeText: { color: "#A1A1AA", fontSize: 11, fontWeight: "700" },
  muted: { color: "#A1A1AA", fontSize: 13, marginTop: 10 },
  menuList: {
    backgroundColor: "#2E2E2E",
    borderRadius: 10,
    paddingHorizontal: 12,
    marginTop: 10,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 9,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#3A3A3A",
  },
  menuName: { color: "#F4F4F4", fontSize: 14, flex: 1 },
  menuValue: { color: "#d08000", fontSize: 14, fontWeight: "800" },
  noteTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 10,
  },
  noteTagText: { color: "#d08000", fontSize: 12, fontWeight: "600" },
  noteTitle: {
    color: "#F4F4F4",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 8,
  },
  preview: { color: "#A1A1AA", fontSize: 13, lineHeight: 19, marginTop: 4 },
  linkChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    borderRadius: 12,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginTop: 10,
  },
  practiceChip: { backgroundColor: "rgba(208,128,0,0.15)" },
  practiceChipText: { color: "#d08000", fontSize: 12, fontWeight: "600" },
  gameChip: { backgroundColor: "rgba(59,130,246,0.15)" },
  gameChipText: { color: "#93c5fd", fontSize: 12, fontWeight: "600" },
});

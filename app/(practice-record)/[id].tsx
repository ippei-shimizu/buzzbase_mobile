import type { ConditionLog } from "../../types/practice";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { formatPracticeValue, menuIconForLog } from "@constants/practice";
import { useNotes } from "@hooks/useNotes";
import { usePracticeMenus } from "@hooks/usePracticeMenus";
import {
  usePracticeSession,
  usePracticeSessionMutations,
} from "@hooks/usePracticeSessions";
import { formatAmount } from "@utils/formatAmount";
import { extractMemoText, type NoteV2 } from "../../types/note";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

const formatJaDate = (iso: string): string => {
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const yearPrefix = year === new Date().getFullYear() ? "" : `${year}年`;
  return `${yearPrefix}${month}月${day}日(${WEEKDAYS[date.getDay()]})`;
};

const LEVEL_META: { icon: keyof typeof Ionicons.glyphMap; color: string }[] = [
  { icon: "remove", color: "#71717A" },
  { icon: "sad", color: "#ef4444" },
  { icon: "sad-outline", color: "#f59e0b" },
  { icon: "happy-outline", color: "#84cc16" },
  { icon: "happy", color: "#22c55e" },
];
const FATIGUE_LABELS = ["", "かなり疲れ", "やや疲れ", "ふつう", "元気"];
const PHYSICAL_LABELS = ["", "不調", "やや不調", "ふつう", "好調"];

function ConditionFace({
  title,
  level,
  labels,
}: {
  title: string;
  level: number;
  labels: string[];
}) {
  const meta = LEVEL_META[level] ?? LEVEL_META[0];
  return (
    <View style={styles.faceTile}>
      <Text style={styles.faceTitle}>{title}</Text>
      <Ionicons name={meta.icon} size={30} color={meta.color} />
      <Text style={styles.faceLabel}>{labels[level] ?? "-"}</Text>
    </View>
  );
}

function ConditionCard({ condition }: { condition: ConditionLog }) {
  const chips: { icon: keyof typeof Ionicons.glyphMap; text: string }[] = [];
  if (condition.sleep_hours != null) {
    chips.push({ icon: "moon", text: `睡眠 ${condition.sleep_hours}h` });
  }
  if (condition.mood) chips.push({ icon: "sparkles", text: condition.mood });
  const injuries = (condition.injuries ?? [])
    .map((injury) => injury.part)
    .filter(Boolean);

  return (
    <View style={styles.conditionCard}>
      <Text style={styles.sectionTitle}>コンディション</Text>
      {condition.fatigue_level != null || condition.physical_level != null ? (
        <View style={styles.faceRow}>
          {condition.fatigue_level != null ? (
            <ConditionFace
              title="疲労度"
              level={condition.fatigue_level}
              labels={FATIGUE_LABELS}
            />
          ) : null}
          {condition.physical_level != null ? (
            <ConditionFace
              title="体調"
              level={condition.physical_level}
              labels={PHYSICAL_LABELS}
            />
          ) : null}
        </View>
      ) : null}
      {chips.length > 0 ? (
        <View style={styles.chipRow}>
          {chips.map((chip) => (
            <View key={chip.text} style={styles.condChip}>
              <Ionicons name={chip.icon} size={13} color="#A1A1AA" />
              <Text style={styles.condChipText}>{chip.text}</Text>
            </View>
          ))}
        </View>
      ) : null}
      {injuries.length > 0 ? (
        <View style={styles.chipRow}>
          {injuries.map((part) => (
            <View key={part} style={styles.injuryChip}>
              <Ionicons name="medkit" size={13} color="#fca5a5" />
              <Text style={styles.injuryChipText}>{part}</Text>
            </View>
          ))}
        </View>
      ) : null}
      {condition.memo ? (
        <Text style={styles.conditionMemo}>{condition.memo}</Text>
      ) : null}
    </View>
  );
}

function LinkedNotes({ sessionId }: { sessionId: number }) {
  const router = useRouter();
  const { notes } = useNotes();
  const linkedNotes = notes.filter(
    (note: NoteV2) => note.practice_session_id === sessionId,
  );
  if (linkedNotes.length === 0) return null;

  return (
    <View style={styles.noteSection}>
      <Text style={styles.sectionTitle}>紐づく野球ノート</Text>
      {linkedNotes.map((note) => {
        const body = extractMemoText(note.memo);
        return (
          <TouchableOpacity
            key={note.id}
            style={styles.noteCard}
            onPress={() => router.push(`/(note)/${note.id}`)}
          >
            <View style={styles.noteCardHeader}>
              <View style={styles.noteIcon}>
                <Ionicons name="document-text" size={16} color="#d08000" />
              </View>
              <Text style={styles.noteTitle} numberOfLines={1}>
                {note.title || "無題のノート"}
              </Text>
              <Ionicons name="chevron-forward" size={18} color="#A1A1AA" />
            </View>
            {body ? (
              <Text style={styles.noteBody} numberOfLines={3}>
                {body}
              </Text>
            ) : null}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function PracticeSessionDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const sessionId = Number(id);
  const { session, isLoading } = usePracticeSession(sessionId);
  const { deleteSession, isDeleting } = usePracticeSessionMutations();
  const { menus } = usePracticeMenus();
  const categoryById = new Map(menus.map((menu) => [menu.id, menu.category]));

  const handleDelete = () => {
    Alert.alert("削除確認", "この練習記録を削除しますか？", [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteSession(sessionId);
            router.back();
          } catch {
            Alert.alert("削除に失敗しました");
          }
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#d08000" />
      </View>
    );
  }
  if (!session) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>練習記録が見つかりません</Text>
      </View>
    );
  }

  const logs = session.practice_logs;

  return (
    <>
      <Stack.Screen
        options={{
          title: "練習の記録",
          headerRight: () => (
            <View style={styles.headerActions}>
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/(practice-record)/daily",
                    params: { date: session.logged_on },
                  })
                }
              >
                <Ionicons name="create-outline" size={22} color="#F4F4F4" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete} disabled={isDeleting}>
                <Ionicons name="trash-outline" size={22} color="#F31260" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <View style={styles.dateHeader}>
          <Text style={styles.dateLabel}>練習日</Text>
          <Text style={styles.date}>{formatJaDate(session.logged_on)}</Text>
        </View>

        {session.memo ? (
          <Text style={styles.sessionMemo}>{session.memo}</Text>
        ) : null}

        <Text style={styles.sectionTitle}>
          メニュー{logs.length > 0 ? `（${logs.length}種類）` : ""}
        </Text>
        {logs.length === 0 ? (
          <Text style={styles.muted}>メニューの記録はありません</Text>
        ) : (
          <View style={styles.menuList}>
            {logs.map((log) => (
              <View key={log.id} style={styles.menuRow}>
                <View style={styles.menuIcon}>
                  <Ionicons
                    name={menuIconForLog(
                      log.source,
                      log.practice_menu_id != null
                        ? categoryById.get(log.practice_menu_id)
                        : undefined,
                    )}
                    size={16}
                    color="#d08000"
                  />
                </View>
                <View style={styles.menuBody}>
                  <Text style={styles.menuName} numberOfLines={1}>
                    {log.menu_name}
                  </Text>
                  {log.memo ? (
                    <Text style={styles.menuMemo} numberOfLines={2}>
                      {log.memo}
                    </Text>
                  ) : null}
                </View>
                {log.weight != null ? (
                  <Text style={styles.menuAmount}>
                    {formatPracticeValue(log)}
                  </Text>
                ) : log.amount != null ? (
                  <Text style={styles.menuAmount}>
                    {formatAmount(log.amount)}
                    <Text style={styles.menuUnit}> {log.unit_label ?? ""}</Text>
                  </Text>
                ) : null}
              </View>
            ))}
          </View>
        )}

        {session.condition ? (
          <ConditionCard condition={session.condition} />
        ) : null}

        <LinkedNotes sessionId={sessionId} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#2E2E2E" },
  content: { padding: 16, paddingBottom: 40 },
  centered: {
    flex: 1,
    backgroundColor: "#2E2E2E",
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: { color: "#A1A1AA", fontSize: 15 },
  headerActions: { flexDirection: "row", gap: 16, paddingRight: 4 },

  dateHeader: { marginBottom: 4 },
  dateLabel: { color: "#A1A1AA", fontSize: 12, fontWeight: "700" },
  date: {
    color: "#F4F4F4",
    fontSize: 20,
    fontWeight: "800",
    marginTop: 2,
  },
  sessionMemo: {
    color: "#F4F4F4",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 16,
  },

  sectionTitle: {
    color: "#A1A1AA",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 24,
    marginBottom: 10,
  },
  muted: { color: "#A1A1AA", fontSize: 13 },

  menuList: {
    backgroundColor: "#3A3A3A",
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2E2E2E",
  },
  menuIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "rgba(208,128,0,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  menuBody: { flex: 1 },
  menuName: { color: "#F4F4F4", fontSize: 15, fontWeight: "600" },
  menuMemo: { color: "#A1A1AA", fontSize: 12, lineHeight: 17, marginTop: 2 },
  menuAmount: { color: "#d08000", fontSize: 18, fontWeight: "800" },
  menuUnit: { color: "#A1A1AA", fontSize: 12, fontWeight: "600" },

  conditionCard: { marginTop: 8 },
  faceRow: { flexDirection: "row", gap: 10 },
  faceTile: {
    flex: 1,
    backgroundColor: "#3A3A3A",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    gap: 4,
  },
  faceTitle: { color: "#A1A1AA", fontSize: 11, fontWeight: "600" },
  faceLabel: { color: "#F4F4F4", fontSize: 13, fontWeight: "700" },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  condChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#3A3A3A",
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  condChipText: { color: "#F4F4F4", fontSize: 12, fontWeight: "600" },
  injuryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(239,68,68,0.15)",
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  injuryChipText: { color: "#fca5a5", fontSize: 12, fontWeight: "600" },
  conditionMemo: {
    color: "#D4D4D8",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 10,
    fontStyle: "italic",
  },

  noteSection: { marginTop: 8 },
  noteCard: {
    backgroundColor: "#3A3A3A",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  noteCardHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  noteIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "rgba(208,128,0,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  noteTitle: { color: "#F4F4F4", fontSize: 15, fontWeight: "700", flex: 1 },
  noteBody: {
    color: "#A1A1AA",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
  },
});

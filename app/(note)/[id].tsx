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
import { GameResultDetail } from "@components/game-results/GameResultDetail";
import { formatPracticeValue } from "@constants/practice";
import { useGameResult } from "@hooks/useGameResults";
import { useNote, useNoteMutations } from "@hooks/useNotes";
import { usePracticeSession } from "@hooks/usePracticeSessions";
import { formatAmount } from "@utils/formatAmount";
import { extractMemoText } from "../../types/note";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

const formatJaDate = (iso: string): string => {
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return `${month}月${day}日(${WEEKDAYS[date.getDay()]})`;
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
      <Text style={styles.subHeader}>コンディション</Text>
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

function LinkedPractice({ sessionId }: { sessionId: number }) {
  const router = useRouter();
  const { session, isLoading } = usePracticeSession(sessionId);
  if (isLoading) return <ActivityIndicator color="#d08000" />;
  if (!session) return null;

  const logs = session.practice_logs;

  return (
    <View style={styles.practiceCard}>
      <View style={styles.practiceHeader}>
        <View style={styles.practiceHeaderLeft}>
          <View style={styles.practiceHeaderIcon}>
            <Ionicons name="fitness" size={20} color="#FFFFFF" />
          </View>
          <View>
            <Text style={styles.cardLabel}>紐付けた練習</Text>
            <Text style={styles.practiceDate}>
              {formatJaDate(session.logged_on)}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() =>
            router.push({
              pathname: "/(practice-record)/daily",
              params: { date: session.logged_on },
            })
          }
        >
          <Ionicons name="create-outline" size={14} color="#d08000" />
          <Text style={styles.cardLink}>編集</Text>
        </TouchableOpacity>
      </View>

      {logs.length === 0 ? (
        <Text style={styles.muted}>メニューの記録はありません</Text>
      ) : (
        <>
          <Text style={styles.menuCount}>{logs.length}種類のメニュー</Text>
          <View style={styles.menuList}>
            {logs.map((log) => (
              <View key={log.id} style={styles.menuRow}>
                <View style={styles.menuIcon}>
                  <Ionicons
                    name={
                      log.source === "shadow_swing" ? "baseball" : "barbell"
                    }
                    size={16}
                    color="#d08000"
                  />
                </View>
                <Text style={styles.menuName} numberOfLines={1}>
                  {log.menu_name}
                </Text>
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
        </>
      )}

      {session.condition ? (
        <ConditionCard condition={session.condition} />
      ) : null}
    </View>
  );
}

function LinkedGame({ gameId }: { gameId: number }) {
  const { gameResult, isLoading } = useGameResult(gameId);
  if (isLoading) return <ActivityIndicator color="#d08000" />;
  if (!gameResult) return null;

  return (
    <View style={styles.gameSection}>
      <Text style={styles.cardLabel}>紐付けた試合記録</Text>
      <GameResultDetail game={gameResult} scroll={false} />
    </View>
  );
}

export default function NoteDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const noteId = Number(id);
  const { note, isLoading } = useNote(noteId);
  const { deleteNote, isDeleting } = useNoteMutations();

  const handleDelete = () => {
    Alert.alert("削除確認", "このノートを削除しますか？", [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteNote(noteId);
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
  if (!note) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>ノートが見つかりません</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <View style={styles.headerActions}>
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/(note)/edit",
                    params: { id: String(noteId) },
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
        <Text style={styles.date}>{note.date}</Text>
        {note.title ? <Text style={styles.title}>{note.title}</Text> : null}
        <Text style={styles.memo}>{extractMemoText(note.memo)}</Text>

        {note.practice_session_id != null ? (
          <LinkedPractice sessionId={note.practice_session_id} />
        ) : null}
        {note.game_result_id != null ? (
          <LinkedGame gameId={note.game_result_id} />
        ) : null}
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
  date: { color: "#A1A1AA", fontSize: 13, fontWeight: "700" },
  title: {
    color: "#F4F4F4",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 6,
  },
  memo: {
    color: "#F4F4F4",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
  },
  cardLabel: { color: "#A1A1AA", fontSize: 12, fontWeight: "700" },
  cardLink: { color: "#d08000", fontSize: 13, fontWeight: "600" },
  muted: { color: "#A1A1AA", fontSize: 13, marginTop: 10 },
  gameSection: { marginTop: 20 },

  practiceCard: {
    backgroundColor: "#3A3A3A",
    borderRadius: 14,
    padding: 16,
    marginTop: 20,
  },
  practiceHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  practiceHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  practiceHeaderIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#d08000",
    alignItems: "center",
    justifyContent: "center",
  },
  practiceDate: {
    color: "#F4F4F4",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 2,
  },
  editButton: { flexDirection: "row", alignItems: "center", gap: 3 },
  menuCount: {
    color: "#A1A1AA",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 14,
    marginBottom: 4,
  },
  menuList: {
    backgroundColor: "#2E2E2E",
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#3A3A3A",
  },
  menuIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "rgba(208,128,0,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  menuName: { color: "#F4F4F4", fontSize: 15, fontWeight: "600", flex: 1 },
  menuAmount: { color: "#d08000", fontSize: 18, fontWeight: "800" },
  menuUnit: { color: "#A1A1AA", fontSize: 12, fontWeight: "600" },

  conditionCard: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#2E2E2E",
  },
  subHeader: {
    color: "#A1A1AA",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 10,
  },
  faceRow: { flexDirection: "row", gap: 10 },
  faceTile: {
    flex: 1,
    backgroundColor: "#2E2E2E",
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
    backgroundColor: "#2E2E2E",
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
});

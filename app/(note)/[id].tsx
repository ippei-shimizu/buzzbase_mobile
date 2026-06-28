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
import { useGameResult } from "@hooks/useGameResults";
import { useNote, useNoteMutations } from "@hooks/useNotes";
import { usePracticeSession } from "@hooks/usePracticeSessions";
import { formatAmount } from "@utils/formatAmount";
import { extractMemoText } from "../../types/note";

const LEVEL_LABEL = ["", "悪い", "ややわるい", "ふつう", "良い"];

function ConditionRow({ condition }: { condition: ConditionLog }) {
  const items: string[] = [];
  if (condition.fatigue_level != null) {
    items.push(
      `疲労: ${LEVEL_LABEL[condition.fatigue_level] ?? condition.fatigue_level}`,
    );
  }
  if (condition.physical_level != null) {
    items.push(
      `体調: ${LEVEL_LABEL[condition.physical_level] ?? condition.physical_level}`,
    );
  }
  if (condition.sleep_hours != null)
    items.push(`睡眠: ${condition.sleep_hours}時間`);
  if (condition.mood) items.push(`気分: ${condition.mood}`);
  const injuries = condition.injuries
    ?.map((injury) => injury.part)
    .filter(Boolean);

  return (
    <View style={styles.conditionBox}>
      <Text style={styles.conditionTitle}>コンディション</Text>
      {items.length > 0 ? (
        <Text style={styles.conditionText}>{items.join(" ・ ")}</Text>
      ) : null}
      {injuries && injuries.length > 0 ? (
        <Text style={styles.conditionText}>怪我: {injuries.join(", ")}</Text>
      ) : null}
      {condition.memo ? (
        <Text style={styles.conditionText}>{condition.memo}</Text>
      ) : null}
    </View>
  );
}

function LinkedPractice({ sessionId }: { sessionId: number }) {
  const router = useRouter();
  const { session, isLoading } = usePracticeSession(sessionId);
  if (isLoading) return <ActivityIndicator color="#d08000" />;
  if (!session) return null;

  return (
    <View style={styles.card}>
      <View style={styles.cardHead}>
        <Text style={styles.cardLabel}>紐付けた練習記録</Text>
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/(practice-record)/daily",
              params: { date: session.logged_on },
            })
          }
        >
          <Text style={styles.cardLink}>編集</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.cardDate}>{session.logged_on}</Text>
      {session.practice_logs.length === 0 ? (
        <Text style={styles.muted}>メニューの記録はありません</Text>
      ) : (
        session.practice_logs.map((log) => (
          <Text key={log.id} style={styles.logLine}>
            ・{log.menu_name}
            {log.amount != null
              ? ` ${formatAmount(log.amount)}${log.unit_label ?? ""}`
              : ""}
          </Text>
        ))
      )}
      {session.condition ? (
        <ConditionRow condition={session.condition} />
      ) : null}
    </View>
  );
}

function LinkedGame({ gameId }: { gameId: number }) {
  const { gameResult, isLoading } = useGameResult(gameId);
  if (isLoading) return <ActivityIndicator color="#d08000" />;
  if (!gameResult) return null;

  const match = gameResult.match_result;
  const result =
    match.my_team_score > match.opponent_team_score
      ? "勝ち"
      : match.my_team_score < match.opponent_team_score
        ? "負け"
        : "引き分け";
  const batting = gameResult.batting_average;

  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>紐付けた試合記録</Text>
      <Text style={styles.cardDate}>
        {match.date_and_time.slice(0, 10)}
        {match.tournament_name ? ` ・ ${match.tournament_name}` : ""}
      </Text>
      <Text style={styles.gameTeams}>
        {match.my_team_name} {match.my_team_score} - {match.opponent_team_score}{" "}
        {match.opponent_team_name}
      </Text>
      <Text style={styles.gameResult}>{result}</Text>
      {batting ? (
        <Text style={styles.logLine}>
          打席 {batting.plate_appearances} ・ 打数 {batting.times_at_bat} ・
          安打 {batting.hit}
        </Text>
      ) : null}
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
  card: {
    backgroundColor: "#3A3A3A",
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  cardHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardLabel: { color: "#A1A1AA", fontSize: 12, fontWeight: "700" },
  cardLink: { color: "#d08000", fontSize: 13, fontWeight: "600" },
  cardDate: { color: "#F4F4F4", fontSize: 15, fontWeight: "700", marginTop: 6 },
  logLine: { color: "#F4F4F4", fontSize: 14, marginTop: 4 },
  muted: { color: "#A1A1AA", fontSize: 13, marginTop: 6 },
  gameTeams: { color: "#F4F4F4", fontSize: 15, marginTop: 6 },
  gameResult: {
    color: "#d08000",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 4,
  },
  conditionBox: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#2E2E2E",
  },
  conditionTitle: { color: "#A1A1AA", fontSize: 12, fontWeight: "700" },
  conditionText: { color: "#F4F4F4", fontSize: 14, marginTop: 4 },
});

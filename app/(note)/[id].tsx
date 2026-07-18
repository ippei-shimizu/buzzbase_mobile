import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
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
import { ConditionCard } from "@components/practice/ConditionCard";
import { PaywallModal } from "@components/pro/PaywallModal";
import { ProUpsellOverlay } from "@components/pro/ProUpsellOverlay";
import { formatPracticeValue } from "@constants/practice";
import { useEntitlement } from "@hooks/useEntitlement";
import { useGameResult } from "@hooks/useGameResults";
import { useNote, useNoteMutations } from "@hooks/useNotes";
import { usePracticeSession } from "@hooks/usePracticeSessions";
import { formatAmount } from "@utils/formatAmount";
import { formatJaFullDate } from "@utils/formatDate";
import { extractMemoText, isReflectionMemo } from "../../types/note";
import { tagLabel } from "../../types/tag";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

const formatJaDate = (iso: string): string => {
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return `${month}月${day}日(${WEEKDAYS[date.getDay()]})`;
};

function LinkedPractice({ sessionId }: { sessionId: number }) {
  const router = useRouter();
  const { hasEntitlement } = useEntitlement();
  const { session, isLoading } = usePracticeSession(sessionId);
  const [isConditionPaywallOpen, setConditionPaywallOpen] = useState(false);
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
        <ProUpsellOverlay
          unlocked={hasEntitlement("detailed_condition_log")}
          feature="detailed_condition_log"
          onPressCta={() => setConditionPaywallOpen(true)}
        >
          <ConditionCard
            condition={session.condition}
            style={styles.conditionCard}
          />
        </ProUpsellOverlay>
      ) : null}
      <PaywallModal
        isOpen={isConditionPaywallOpen}
        onClose={() => setConditionPaywallOpen(false)}
        feature="detailed_condition_log"
      />
    </View>
  );
}

function LinkedGame({ gameId }: { gameId: number }) {
  const { gameResult, isLoading } = useGameResult(gameId);
  if (isLoading) return <ActivityIndicator color="#d08000" />;
  if (!gameResult) return null;

  return (
    <View style={styles.gameSection}>
      <Text style={[styles.cardLabel, styles.gameLabel]}>紐付けた試合記録</Text>
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

  const memoText = extractMemoText(note.memo);
  const reflectionAnswers = note.reflection_answers ?? [];
  // 合成由来メモ（テンプレのみのノート）は下のテンプレ回答表示と重複するため隠す。
  const showFreeMemo =
    memoText.length > 0 && !isReflectionMemo(memoText, reflectionAnswers);

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
        <Text style={styles.date}>{formatJaFullDate(note.date)}</Text>
        {note.title ? <Text style={styles.title}>{note.title}</Text> : null}
        {note.tags?.length ? (
          <View style={styles.tagRow}>
            {note.tags.map((tag) => (
              <View key={tag.id} style={styles.tagChip}>
                <Text style={styles.tagChipText}>{tagLabel(tag.name)}</Text>
              </View>
            ))}
          </View>
        ) : null}
        {showFreeMemo ? <Text style={styles.memo}>{memoText}</Text> : null}
        {reflectionAnswers.length > 0 ? (
          <View style={styles.reflection}>
            {reflectionAnswers.map((item) => (
              <View key={item.question} style={styles.reflectionItem}>
                <Text style={styles.reflectionQuestion}>
                  【{item.question}】
                </Text>
                <Text style={styles.reflectionAnswer}>{item.answer}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {note.practice_session_id != null ? (
          <LinkedPractice sessionId={note.practice_session_id} />
        ) : null}
        {note.game_result_ids.map((gameResultId) => (
          <LinkedGame key={gameResultId} gameId={gameResultId} />
        ))}
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
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 },
  tagChip: {
    backgroundColor: "#3A3A3A",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagChipText: { color: "#D4D4D8", fontSize: 12, fontWeight: "600" },
  memo: {
    color: "#F4F4F4",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
  },
  reflection: { marginTop: 12, gap: 16 },
  reflectionItem: { gap: 4 },
  reflectionQuestion: {
    color: "#d08000",
    fontSize: 14,
    fontWeight: "700",
  },
  reflectionAnswer: {
    color: "#F4F4F4",
    fontSize: 15,
    lineHeight: 22,
  },
  cardLabel: { color: "#A1A1AA", fontSize: 12, fontWeight: "700" },
  gameLabel: { marginBottom: 10 },
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
});

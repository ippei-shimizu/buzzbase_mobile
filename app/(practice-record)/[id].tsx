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
import { ConditionCard } from "@components/practice/ConditionCard";
import { PaywallModal } from "@components/pro/PaywallModal";
import { ProUpsellOverlay } from "@components/pro/ProUpsellOverlay";
import { formatPracticeValue, menuIconForLog } from "@constants/practice";
import { useEntitlement } from "@hooks/useEntitlement";
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
  const { hasEntitlement, isLoading: isProLoading } = useEntitlement();
  const categoryById = new Map(menus.map((menu) => [menu.id, menu.category]));
  const [isConditionPaywallOpen, setConditionPaywallOpen] = useState(false);

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
          <>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitleInline}>コンディション</Text>
              {!isProLoading && !hasEntitlement("detailed_condition_log") ? (
                <Text style={styles.proBadge}>Pro限定</Text>
              ) : null}
            </View>
            <ProUpsellOverlay
              unlocked={hasEntitlement("detailed_condition_log")}
              loading={isProLoading}
              feature="detailed_condition_log"
              onPressCta={() => setConditionPaywallOpen(true)}
            >
              <ConditionCard condition={session.condition} />
            </ProUpsellOverlay>
          </>
        ) : null}

        <LinkedNotes sessionId={sessionId} />
      </ScrollView>
      <PaywallModal
        isOpen={isConditionPaywallOpen}
        onClose={() => setConditionPaywallOpen(false)}
        feature="detailed_condition_log"
      />
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
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 24,
    marginBottom: 10,
  },
  sectionTitleInline: {
    color: "#F4F4F4",
    fontSize: 15,
    fontWeight: "700",
  },
  proBadge: {
    color: "#d08000",
    fontSize: 12,
    fontWeight: "700",
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

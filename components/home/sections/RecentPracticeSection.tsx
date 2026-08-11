import type { ConditionLog, PracticeSession } from "../../../types/practice";
import { useRouter } from "expo-router";
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Icon } from "@components/icon/Icon";
import { formatPracticeValue, menuIconForLog } from "@constants/practice";
import { useNotes } from "@hooks/useNotes";
import { usePracticeMenus } from "@hooks/usePracticeMenus";
import { usePracticeSessions } from "@hooks/usePracticeSessions";
import { SectionCard, SectionPlaceholder } from "./SectionCard";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

// コンディションの体調/疲労レベル（0〜4）を表情アイコンと色で表す。詳細画面と同じ表現。
const LEVEL_META = [
  { icon: "remove" as const, color: "#71717A" },
  { icon: "sad" as const, color: "#ef4444" },
  { icon: "sad-outline" as const, color: "#f59e0b" },
  { icon: "happy-outline" as const, color: "#84cc16" },
  { icon: "happy" as const, color: "#22c55e" },
];
const PHYSICAL_LABELS = ["", "不調", "やや不調", "ふつう", "好調"];
const FATIGUE_LABELS = ["", "かなり疲れ", "やや疲れ", "ふつう", "元気"];

/** logged_on を「今日 (火)」「昨日 (月)」「5/12 (水)」のような相対＋曜日表記にする。 */
function formatDateLabel(iso: string): { main: string; weekday: string } {
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const diffDays = Math.round(
    (startOfToday.getTime() - date.getTime()) / 86_400_000,
  );
  const weekday = WEEKDAYS[date.getDay()];
  const main =
    diffDays === 0
      ? "今日"
      : diffDays === 1
        ? "昨日"
        : diffDays === 2
          ? "一昨日"
          : `${month}/${day}`;
  return { main, weekday };
}

/** その日のコンディションを1つのバッジに要約する（体調→疲労→気分の優先で1指標）。 */
function conditionBadge(condition: ConditionLog | null) {
  if (!condition) return null;
  if (condition.physical_level != null) {
    const meta = LEVEL_META[condition.physical_level] ?? LEVEL_META[0];
    return {
      icon: meta.icon,
      color: meta.color,
      text: PHYSICAL_LABELS[condition.physical_level] ?? "",
    };
  }
  if (condition.fatigue_level != null) {
    const meta = LEVEL_META[condition.fatigue_level] ?? LEVEL_META[0];
    return {
      icon: meta.icon,
      color: meta.color,
      text: FATIGUE_LABELS[condition.fatigue_level] ?? "",
    };
  }
  if (condition.mood) {
    return {
      icon: "sparkles" as const,
      color: "#d08000",
      text: condition.mood,
    };
  }
  return null;
}

/**
 * 最近の練習タイムライン。日付ごとにメニュー・記録量・コンディション・ノートを
 * スキャンしやすくまとめ、タップでその日のセッション詳細へ遷移する。
 */
export function RecentPracticeSection() {
  const router = useRouter();
  const { sessions } = usePracticeSessions();
  const { notes } = useNotes();
  const { menus } = usePracticeMenus();
  const recent = sessions.slice(0, 5);

  // 練習ログにカテゴリアイコンを出すため menu_id → category を引けるようにする。
  const categoryByMenu = new Map(menus.map((menu) => [menu.id, menu.category]));
  // 練習ログIDごとに紐付いたノートのプレビューを引けるようにする。
  const noteByLog = new Map(
    notes
      .filter((note) => note.practice_log_id != null)
      .map((note) => [note.practice_log_id, note.memo_preview]),
  );

  const openSession = (session: PracticeSession) =>
    router.push(`/(practice-record)/${session.id}`);

  return (
    <SectionCard title="最近の練習">
      {recent.length === 0 ? (
        <SectionPlaceholder message="記録した練習がここに新しい順で並びます" />
      ) : (
        recent.map((session, index) => {
          const { main, weekday } = formatDateLabel(session.logged_on);
          const badge = conditionBadge(session.condition);
          return (
            <TouchableOpacity
              key={session.id}
              activeOpacity={0.6}
              accessibilityRole="button"
              accessibilityLabel={`${main}の練習の詳細を開く`}
              onPress={() => openSession(session)}
              style={[
                styles.day,
                index === recent.length - 1 && styles.dayLast,
              ]}
            >
              <View style={styles.header}>
                <View style={styles.dateWrap}>
                  <Text style={styles.date}>{main}</Text>
                  <Text style={styles.weekday}>({weekday})</Text>
                </View>
                {badge ? (
                  <View style={styles.badge}>
                    <Icon name={badge.icon} size={13} color={badge.color} />
                    <Text style={[styles.badgeText, { color: badge.color }]}>
                      {badge.text}
                    </Text>
                  </View>
                ) : null}
                <Icon name="chevron-forward" size={16} color="#71717A" />
              </View>

              {session.practice_logs.map((log) => {
                const value = formatPracticeValue(log);
                return (
                  <View key={log.id} style={styles.logRow}>
                    <View style={styles.logMain}>
                      <Icon
                        name={menuIconForLog(
                          log.source,
                          log.practice_menu_id != null
                            ? categoryByMenu.get(log.practice_menu_id)
                            : undefined,
                        )}
                        size={15}
                        color="#A1A1AA"
                        style={styles.logIcon}
                      />
                      <Text style={styles.name} numberOfLines={1}>
                        {log.menu_name}
                      </Text>
                      {value ? <Text style={styles.value}>{value}</Text> : null}
                    </View>
                    {noteByLog.get(log.id) ? (
                      <View style={styles.noteRow}>
                        <Icon name="pencil" size={11} color="#71717A" />
                        <Text style={styles.note} numberOfLines={2}>
                          {noteByLog.get(log.id)}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                );
              })}

              {session.memo ? (
                <Text style={styles.sessionMemo} numberOfLines={2}>
                  {session.memo}
                </Text>
              ) : null}
            </TouchableOpacity>
          );
        })
      )}
      {recent.length > 0 ? (
        <TouchableOpacity
          style={styles.viewAll}
          activeOpacity={0.6}
          accessibilityRole="button"
          onPress={() => router.push("/(records)/list")}
        >
          <Text style={styles.viewAllText}>すべての記録を見る</Text>
          <Icon name="chevron-forward" size={14} color="#d08000" />
        </TouchableOpacity>
      ) : null}
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  day: {
    paddingVertical: 12,
    borderBottomColor: "#4A4A4A",
    borderBottomWidth: 1,
  },
  dayLast: {
    borderBottomWidth: 0,
    paddingBottom: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  dateWrap: { flexDirection: "row", alignItems: "baseline", gap: 4, flex: 1 },
  date: { color: "#F4F4F4", fontSize: 14, fontWeight: "700" },
  weekday: { color: "#71717A", fontSize: 12, fontWeight: "600" },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#2E2E2E",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: { fontSize: 11, fontWeight: "700" },
  logRow: { paddingVertical: 3, marginLeft: 2 },
  logMain: { flexDirection: "row", alignItems: "center", gap: 8 },
  logIcon: { width: 16, textAlign: "center" },
  name: { color: "#F4F4F4", fontSize: 14, flexShrink: 1 },
  value: { color: "#D4D4D8", fontSize: 13, fontWeight: "700", marginLeft: 2 },
  noteRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 4,
    marginTop: 3,
    marginLeft: 24,
  },
  note: { color: "#A1A1AA", fontSize: 12, flex: 1, lineHeight: 16 },
  sessionMemo: {
    color: "#A1A1AA",
    fontSize: 12,
    lineHeight: 16,
    marginTop: 6,
    marginLeft: 2,
  },
  viewAll: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    paddingTop: 12,
    marginTop: 4,
  },
  viewAllText: { color: "#d08000", fontSize: 13, fontWeight: "600" },
});

import type { PresetMenu } from "../../types/practice";
import type { Schedule } from "../../types/schedule";
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
import { PlanMenuRow } from "@components/schedule/PlanMenuRow";
import { dayLabels, eventTypeMeta } from "@constants/schedule";
import {
  dayPlanMenuKey,
  useDayPlan,
  useToggleDayPlanMenu,
} from "@hooks/usePlans";
import { useScheduleMutations, useSchedules } from "@hooks/useSchedules";
import { useGameRecordStore } from "@stores/gameRecordStore";
import { formatJaFullDate } from "@utils/formatDate";
import { todayIso } from "@utils/planDate";

const whenLabel = (schedule: Schedule): string => {
  if (schedule.days_of_week) return `毎週 ${dayLabels(schedule.days_of_week)}`;
  if (schedule.planned_on) return formatJaFullDate(schedule.planned_on);
  return "";
};

export default function ScheduleDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string; date?: string }>();
  const scheduleId = Number(params.id);
  // カレンダー・週プラン経由では日付が渡り、その日の文脈でメニューの済トグルを有効にする。
  const dateContext = params.date ?? null;
  const { schedules, isLoading } = useSchedules();
  const { deleteSchedule } = useScheduleMutations();
  const schedule = schedules.find((item) => item.id === scheduleId);

  const { plans } = useDayPlan(dateContext);
  const { toggleMenu, togglingMenuKey } = useToggleDayPlanMenu(
    dateContext ?? todayIso(),
  );
  const dayPlan = dateContext
    ? plans.find((plan) => plan.id === scheduleId)
    : undefined;

  // 済（当日ログ済み）のメニューだけ練習記録画面に引き継ぐ。
  const doneMenus: PresetMenu[] = dayPlan
    ? dayPlan.menus
        .filter((menu) => menu.done)
        .map((menu) => ({
          practice_menu_id: menu.practice_menu_id,
          target_value: menu.target_value,
        }))
    : [];
  const recordDate = dateContext ?? schedule?.planned_on ?? null;

  const goEdit = () => router.push(`/(schedule)/new?id=${scheduleId}`);
  const goRecordPractice = () =>
    router.push({
      pathname: "/(practice-record)/daily",
      params: {
        ...(recordDate ? { date: recordDate } : {}),
        ...(doneMenus.length > 0
          ? { presetMenus: JSON.stringify(doneMenus) }
          : {}),
      },
    });
  const goRecordGame = () => {
    // 直前の編集モードフラグが残っていると Step1 が編集モードのまま起動するため、
    // 新規記録の入口では store を必ず初期化する。
    useGameRecordStore.getState().reset();
    if (recordDate) useGameRecordStore.getState().setField("date", recordDate);
    router.push("/(game-record)/step1-game-info");
  };

  const handleDelete = () => {
    if (!schedule) return;
    Alert.alert(
      "予定を削除しますか？",
      schedule.title ?? eventTypeMeta(schedule.event_type).label,
      [
        { text: "キャンセル", style: "cancel" },
        {
          text: "削除",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteSchedule(scheduleId);
              router.back();
            } catch {
              Alert.alert("削除に失敗しました");
            }
          },
        },
      ],
    );
  };

  if (isLoading && !schedule) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#d08000" />
      </View>
    );
  }

  if (!schedule) {
    return (
      <View style={styles.centered}>
        <Text style={styles.notFound}>予定が見つかりません</Text>
      </View>
    );
  }

  const meta = eventTypeMeta(schedule.event_type);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={goEdit}>
                <Ionicons name="create-outline" size={22} color="#F4F4F4" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete}>
                <Ionicons name="trash-outline" size={22} color="#F31260" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <View style={styles.titleRow}>
        <View style={[styles.eventBar, { backgroundColor: meta.color }]} />
        <View style={styles.titleMain}>
          <Text style={styles.title}>{schedule.title ?? meta.label}</Text>
          <View style={[styles.badge, { backgroundColor: `${meta.color}22` }]}>
            <View style={[styles.dot, { backgroundColor: meta.color }]} />
            <Text style={[styles.badgeText, { color: meta.color }]}>
              {meta.label}
            </Text>
          </View>
        </View>
      </View>

      <InfoRow icon="calendar-outline" label={whenLabel(schedule)} />
      {schedule.scheduled_time ? (
        <InfoRow icon="time-outline" label={schedule.scheduled_time} />
      ) : null}
      <InfoRow
        icon={
          schedule.notification_enabled
            ? "notifications-outline"
            : "notifications-off-outline"
        }
        label={
          schedule.notification_enabled
            ? "プッシュ通知 オン"
            : "プッシュ通知 オフ"
        }
      />
      {schedule.notification_message ? (
        <InfoRow
          icon="chatbubble-outline"
          label={schedule.notification_message}
        />
      ) : null}

      {dayPlan && dayPlan.menus.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            メニュー（{formatJaFullDate(dateContext as string)}）
          </Text>
          {dayPlan.menus.map((menu) => (
            <PlanMenuRow
              key={menu.practice_menu_id}
              menu={menu}
              onToggle={(target) =>
                toggleMenu({
                  scheduleId,
                  practiceMenuId: target.practice_menu_id,
                  done: target.done,
                })
              }
              isToggling={
                togglingMenuKey ===
                dayPlanMenuKey(scheduleId, menu.practice_menu_id)
              }
            />
          ))}
        </View>
      ) : schedule.menus.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>メニュー</Text>
          {schedule.menus.map((menu) => (
            <View key={menu.practice_menu_id} style={styles.menuRow}>
              <Ionicons name="ellipse" size={6} color="#d08000" />
              <Text style={styles.menuText}>
                {menu.name}
                {menu.target_value != null
                  ? `  ${menu.target_value}${menu.unit_label ?? ""}`
                  : ""}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {schedule.note ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>メモ</Text>
          <Text style={styles.noteText}>{schedule.note}</Text>
        </View>
      ) : null}

      {schedule.event_type === "game" ? (
        <TouchableOpacity style={styles.recordButton} onPress={goRecordGame}>
          <Ionicons name="baseball-outline" size={16} color="#FFFFFF" />
          <Text style={styles.recordButtonText}>試合記録をつける</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.recordButton}
          onPress={goRecordPractice}
        >
          <Ionicons name="create-outline" size={16} color="#FFFFFF" />
          <Text style={styles.recordButtonText}>練習記録をつける</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

function InfoRow({
  icon,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={18} color="#A1A1AA" />
      <Text style={styles.infoText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#2E2E2E" },
  content: { padding: 16, paddingBottom: 48 },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2E2E2E",
  },
  notFound: { color: "#A1A1AA", fontSize: 14 },
  headerActions: { flexDirection: "row", gap: 16, paddingRight: 4 },
  titleRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
  eventBar: { width: 4, alignSelf: "stretch", borderRadius: 2 },
  titleMain: { flex: 1, gap: 8 },
  title: { color: "#F4F4F4", fontSize: 20, fontWeight: "700" },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 12, fontWeight: "700" },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#4A4A4A",
  },
  infoText: { color: "#F4F4F4", fontSize: 14, flex: 1 },
  section: { marginTop: 20 },
  sectionTitle: {
    color: "#A1A1AA",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 5,
  },
  menuText: { color: "#F4F4F4", fontSize: 14 },
  noteText: { color: "#F4F4F4", fontSize: 14, lineHeight: 21 },
  recordButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 28,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: "#d08000",
  },
  recordButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
});

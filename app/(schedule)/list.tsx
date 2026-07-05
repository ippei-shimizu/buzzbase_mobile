import type { Schedule } from "../../types/schedule";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import { dayLabels, eventTypeMeta } from "@constants/schedule";
import { useScheduleMutations, useSchedules } from "@hooks/useSchedules";
import { syncScheduleReminders } from "@services/scheduleReminderService";
import { formatMonthDay } from "@utils/planDate";

const isExpoGo = Constants.appOwnership === "expo";

const whenLabel = (schedule: Schedule): string => {
  const time = schedule.scheduled_time ? ` ・ ${schedule.scheduled_time}` : "";
  if (schedule.days_of_week) {
    return `毎週 ${dayLabels(schedule.days_of_week)}${time}`;
  }
  if (schedule.planned_on) {
    return `${formatMonthDay(schedule.planned_on)}${time}`;
  }
  return time.trim();
};

export default function ScheduleListScreen() {
  const router = useRouter();
  const { schedules, isLoading } = useSchedules();
  const { deleteSchedule } = useScheduleMutations();

  // スケジュールが変わるたびに端末のローカル通知を貼り直す。
  useEffect(() => {
    if (isExpoGo) return;
    void syncScheduleReminders(schedules);
  }, [schedules]);

  const handleDelete = (id: number, title: string) => {
    Alert.alert("削除しますか？", title, [
      { text: "キャンセル", style: "cancel" },
      { text: "削除", style: "destructive", onPress: () => deleteSchedule(id) },
    ]);
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#d08000" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.quickRow}>
        <QuickLink
          icon="albums-outline"
          label="メニューセット"
          onPress={() => router.push("/(menu-set)/list")}
        />
        <QuickLink
          icon="grid-outline"
          label="週プラン"
          onPress={() => router.push("/(schedule)/weekly")}
        />
        <QuickLink
          icon="calendar-outline"
          label="カレンダー"
          onPress={() => router.push("/(schedule)/calendar")}
        />
      </View>

      {schedules.length === 0 ? (
        <Text style={styles.empty}>
          割り当てを登録すると、設定した曜日・日付に通知が届きます
        </Text>
      ) : (
        schedules.map((schedule) => {
          const meta = eventTypeMeta(schedule.event_type);
          return (
            <TouchableOpacity
              key={schedule.id}
              style={styles.card}
              onPress={() => router.push(`/(schedule)/new?id=${schedule.id}`)}
            >
              <View
                style={[styles.eventBar, { backgroundColor: meta.color }]}
              />
              <View style={styles.cardMain}>
                <Text style={styles.cardTitle}>
                  {schedule.title ?? meta.label}
                </Text>
                <Text style={styles.cardMeta}>{whenLabel(schedule)}</Text>
                {schedule.menus.length > 0 ? (
                  <Text style={styles.cardMenus} numberOfLines={1}>
                    {schedule.menus.map((menu) => menu.name).join("・")}
                  </Text>
                ) : null}
              </View>
              <TouchableOpacity
                hitSlop={8}
                onPress={() =>
                  handleDelete(schedule.id, schedule.title ?? meta.label)
                }
              >
                <Ionicons name="trash-outline" size={20} color="#71717A" />
              </TouchableOpacity>
            </TouchableOpacity>
          );
        })
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push("/(schedule)/new")}
      >
        <Ionicons name="add" size={18} color="#FFFFFF" />
        <Text style={styles.addButtonText}>新しい割り当て</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function QuickLink({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.quickLink} onPress={onPress}>
      <Ionicons name={icon} size={20} color="#d08000" />
      <Text style={styles.quickText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#2E2E2E" },
  content: { padding: 16, paddingBottom: 40 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  quickRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  quickLink: {
    flex: 1,
    alignItems: "center",
    gap: 6,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#3A3A3A",
  },
  quickText: { color: "#F4F4F4", fontSize: 12, fontWeight: "600" },
  empty: {
    color: "#A1A1AA",
    fontSize: 14,
    textAlign: "center",
    marginVertical: 24,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#3A3A3A",
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
  },
  eventBar: { width: 4, alignSelf: "stretch", borderRadius: 2 },
  cardMain: { flex: 1 },
  cardTitle: { color: "#F4F4F4", fontSize: 15, fontWeight: "700" },
  cardMeta: { color: "#A1A1AA", fontSize: 13, marginTop: 4 },
  cardMenus: { color: "#71717A", fontSize: 12, marginTop: 4 },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#d08000",
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 12,
  },
  addButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
});

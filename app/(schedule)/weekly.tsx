import type { Schedule } from "../../types/schedule";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { eventTypeMeta } from "@constants/schedule";
import { useSchedules, useScheduleMutations } from "@hooks/useSchedules";
import { addDays, fromIsoDate, mondayOf, todayIso } from "@utils/planDate";

const WEEKDAY_LABELS = ["月", "火", "水", "木", "金", "土", "日"];

export default function WeeklyPlanScreen() {
  const router = useRouter();
  const { schedules } = useSchedules();
  const { createSchedule } = useScheduleMutations();
  const [weekStart, setWeekStart] = useState<string>(mondayOf(todayIso()));

  const weekEnd = addDays(weekStart, 6);

  const byDate = useMemo(() => {
    const map = new Map<string, Schedule[]>();
    for (const schedule of schedules) {
      if (!schedule.planned_on) continue;
      if (schedule.planned_on < weekStart || schedule.planned_on > weekEnd)
        continue;
      const list = map.get(schedule.planned_on) ?? [];
      list.push(schedule);
      map.set(schedule.planned_on, list);
    }
    return map;
  }, [schedules, weekStart, weekEnd]);

  const rangeLabel = `${fromIsoDate(weekStart).getMonth() + 1}/${fromIsoDate(weekStart).getDate()}〜${fromIsoDate(weekEnd).getMonth() + 1}/${fromIsoDate(weekEnd).getDate()}`;

  const copyToNextWeek = async () => {
    const singles = schedules.filter(
      (schedule) =>
        schedule.planned_on &&
        schedule.planned_on >= weekStart &&
        schedule.planned_on <= weekEnd,
    );
    if (singles.length === 0) {
      return Alert.alert("コピーする単発の予定がありません");
    }
    try {
      for (const schedule of singles) {
        await createSchedule({
          title: schedule.title,
          event_type: schedule.event_type,
          scheduled_time: schedule.scheduled_time,
          planned_on: addDays(schedule.planned_on as string, 7),
          notification_enabled: schedule.notification_enabled,
          notification_message: schedule.notification_message,
          menu_set_id: schedule.menu_set_id,
          menus: schedule.menu_set_id
            ? undefined
            : schedule.menus.map((menu) => ({
                practice_menu_id: menu.practice_menu_id,
                target_value: menu.target_value,
              })),
        });
      }
      setWeekStart((prev) => addDays(prev, 7));
    } catch {
      Alert.alert(
        "コピーできませんでした",
        "無料プランは予定3つまでです。Pro で無制限になります。",
      );
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => setWeekStart((prev) => addDays(prev, -7))}
          hitSlop={10}
        >
          <Ionicons name="chevron-back" size={22} color="#F4F4F4" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>今週のプラン {rangeLabel}</Text>
        <TouchableOpacity
          onPress={() => setWeekStart((prev) => addDays(prev, 7))}
          hitSlop={10}
        >
          <Ionicons name="chevron-forward" size={22} color="#F4F4F4" />
        </TouchableOpacity>
      </View>

      {WEEKDAY_LABELS.map((label, index) => {
        const iso = addDays(weekStart, index);
        const dayEntries = byDate.get(iso) ?? [];
        return (
          <View key={iso} style={styles.dayRow}>
            <View style={styles.dayHead}>
              <Text style={styles.dayLabel}>{label}</Text>
              <Text style={styles.dayDate}>{fromIsoDate(iso).getDate()}</Text>
            </View>
            <View style={styles.dayBody}>
              {dayEntries.map((schedule) => {
                const meta = eventTypeMeta(schedule.event_type);
                return (
                  <TouchableOpacity
                    key={schedule.id}
                    style={styles.chip}
                    onPress={() =>
                      router.push(`/(schedule)/${schedule.id}?date=${iso}`)
                    }
                  >
                    <View
                      style={[styles.dot, { backgroundColor: meta.color }]}
                    />
                    <Text style={styles.chipText} numberOfLines={1}>
                      {schedule.title ?? meta.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity
                style={styles.addChip}
                onPress={() =>
                  router.push(`/(schedule)/new?date=${iso}&singleOnly=1`)
                }
              >
                <Ionicons name="add" size={16} color="#d08000" />
              </TouchableOpacity>
            </View>
          </View>
        );
      })}

      <TouchableOpacity style={styles.copyButton} onPress={copyToNextWeek}>
        <Ionicons name="copy-outline" size={16} color="#F4F4F4" />
        <Text style={styles.copyText}>来週にコピー</Text>
      </TouchableOpacity>
      <Text style={styles.note}>
        毎週の繰り返し予定はカレンダーから登録できます
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#2E2E2E" },
  content: { padding: 16, paddingBottom: 40 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerTitle: { color: "#F4F4F4", fontSize: 15, fontWeight: "700" },
  dayRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#4A4A4A",
  },
  dayHead: { width: 36, alignItems: "center" },
  dayLabel: { color: "#F4F4F4", fontSize: 14, fontWeight: "700" },
  dayDate: { color: "#71717A", fontSize: 11, marginTop: 2 },
  dayBody: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: "#3A3A3A",
    maxWidth: "70%",
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  chipText: { color: "#F4F4F4", fontSize: 12 },
  addChip: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#d08000",
  },
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#3A3A3A",
  },
  copyText: { color: "#F4F4F4", fontSize: 14, fontWeight: "600" },
  note: {
    color: "#71717A",
    fontSize: 12,
    textAlign: "center",
    marginTop: 12,
  },
});

import type { Schedule } from "../../types/schedule";
import { Ionicons } from "@expo/vector-icons";
import { isAxiosError } from "axios";
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
import { PaywallModal } from "@components/pro/PaywallModal";
import { eventTypeMeta } from "@constants/schedule";
import { useEntitlement } from "@hooks/useEntitlement";
import { useSchedules } from "@hooks/useSchedules";
import { copyScheduleWeekToNext } from "@services/scheduleService";
import { addDays, fromIsoDate, mondayOf, todayIso } from "@utils/planDate";

const WEEKDAY_LABELS = ["月", "火", "水", "木", "金", "土", "日"];

/**
 * 週間の練習プラン表示。「来週にコピー」はPro限定機能。
 * 練習プラン画面（(menu-set)/list.tsx）のタブと、単独ルート（(schedule)/weekly.tsx）の
 * 両方から使う共通ビュー。
 */
export function WeeklyPlanView() {
  const router = useRouter();
  const { schedules } = useSchedules();
  const { hasEntitlement } = useEntitlement();
  const [weekStart, setWeekStart] = useState<string>(mondayOf(todayIso()));
  const [isCopying, setCopying] = useState(false);
  const [isPaywallOpen, setPaywallOpen] = useState(false);

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

  const handleCopyToNextWeek = () => {
    if (!hasEntitlement("schedule_copy_next_week")) {
      setPaywallOpen(true);
      return;
    }
    void copyToNextWeek();
  };

  const copyToNextWeek = async () => {
    setCopying(true);
    try {
      const copied = await copyScheduleWeekToNext(weekStart);
      if (copied.length === 0) {
        Alert.alert("コピーする単発の予定がありません");
        return;
      }
      setWeekStart((prev) => addDays(prev, 7));
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 403) {
        setPaywallOpen(true);
      } else {
        Alert.alert("コピーできませんでした");
      }
    } finally {
      setCopying(false);
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

      <TouchableOpacity
        style={[styles.copyButton, isCopying && styles.copyButtonDisabled]}
        onPress={handleCopyToNextWeek}
        disabled={isCopying}
      >
        <Ionicons name="copy-outline" size={16} color="#F4F4F4" />
        <Text style={styles.copyText}>来週にコピー</Text>
        {!hasEntitlement("schedule_copy_next_week") ? (
          <Ionicons name="lock-closed" size={14} color="#A1A1AA" />
        ) : null}
      </TouchableOpacity>
      <Text style={styles.note}>
        毎週の繰り返し予定はカレンダーから登録できます
      </Text>
      <PaywallModal
        isOpen={isPaywallOpen}
        onClose={() => setPaywallOpen(false)}
        feature="schedule_copy_next_week"
      />
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
  copyButtonDisabled: { opacity: 0.5 },
  copyText: { color: "#F4F4F4", fontSize: 14, fontWeight: "600" },
  note: {
    color: "#71717A",
    fontSize: 12,
    textAlign: "center",
    marginTop: 12,
  },
});

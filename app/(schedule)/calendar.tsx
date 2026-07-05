import type { CalendarEntry } from "../../types/plan";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { eventTypeMeta } from "@constants/schedule";
import { useCalendar } from "@hooks/usePlans";
import { todayIso } from "@utils/planDate";

const WEEKDAY_HEADER = ["日", "月", "火", "水", "木", "金", "土"];
const pad = (value: number): string => String(value).padStart(2, "0");

export default function CalendarScreen() {
  const router = useRouter();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth()); // 0-11
  const [selected, setSelected] = useState<string>(todayIso());

  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const from = `${year}-${pad(month + 1)}-01`;
  const to = `${year}-${pad(month + 1)}-${pad(daysInMonth)}`;
  const { entries, isLoading } = useCalendar(from, to);

  const byDate = useMemo(() => {
    const map = new Map<string, CalendarEntry[]>();
    for (const entry of entries) {
      const list = map.get(entry.date) ?? [];
      list.push(entry);
      map.set(entry.date, list);
    }
    return map;
  }, [entries]);

  const cells: (number | null)[] = [
    ...Array(firstDay.getDay()).fill(null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];

  const shiftMonth = (delta: number) => {
    const next = new Date(year, month + delta, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth());
  };

  const isoFor = (day: number): string =>
    `${year}-${pad(month + 1)}-${pad(day)}`;
  const selectedEntries = byDate.get(selected) ?? [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => shiftMonth(-1)} hitSlop={10}>
          <Ionicons name="chevron-back" size={22} color="#F4F4F4" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {year}年 {month + 1}月
        </Text>
        <TouchableOpacity onPress={() => shiftMonth(1)} hitSlop={10}>
          <Ionicons name="chevron-forward" size={22} color="#F4F4F4" />
        </TouchableOpacity>
      </View>

      <View style={styles.weekHeader}>
        {WEEKDAY_HEADER.map((label) => (
          <Text key={label} style={styles.weekHeaderText}>
            {label}
          </Text>
        ))}
      </View>

      {isLoading ? (
        <ActivityIndicator color="#d08000" style={styles.loading} />
      ) : (
        <View style={styles.grid}>
          {cells.map((day, index) => {
            if (day === null) {
              return <View key={`blank-${index}`} style={styles.cell} />;
            }
            const iso = isoFor(day);
            const dayEntries = byDate.get(iso) ?? [];
            const active = iso === selected;
            const isToday = iso === todayIso();
            return (
              <TouchableOpacity
                key={iso}
                style={[styles.cell, active && styles.cellActive]}
                onPress={() => setSelected(iso)}
              >
                <Text
                  style={[
                    styles.cellDay,
                    isToday && styles.cellToday,
                    active && styles.cellDayActive,
                  ]}
                >
                  {day}
                </Text>
                <View style={styles.dotRow}>
                  {dayEntries.slice(0, 3).map((entry, dotIndex) => (
                    <View
                      key={`${entry.schedule_id}-${dotIndex}`}
                      style={[
                        styles.dot,
                        {
                          backgroundColor: eventTypeMeta(entry.event_type)
                            .color,
                        },
                      ]}
                    />
                  ))}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <View style={styles.detail}>
        <Text style={styles.detailDate}>{selected}</Text>
        {selectedEntries.length === 0 ? (
          <Text style={styles.detailEmpty}>予定はありません</Text>
        ) : (
          selectedEntries.map((entry, index) => {
            const meta = eventTypeMeta(entry.event_type);
            return (
              <TouchableOpacity
                key={`${entry.schedule_id}-${index}`}
                style={styles.detailRow}
                onPress={() =>
                  router.push(`/(schedule)/new?id=${entry.schedule_id}`)
                }
              >
                <View style={[styles.dot, { backgroundColor: meta.color }]} />
                <Text style={styles.detailTitle} numberOfLines={1}>
                  {entry.title ?? meta.label}
                </Text>
                <Ionicons name="chevron-forward" size={16} color="#71717A" />
              </TouchableOpacity>
            );
          })
        )}

        <TouchableOpacity
          style={styles.addRow}
          onPress={() => router.push(`/(schedule)/new?date=${selected}`)}
        >
          <Ionicons name="add" size={16} color="#d08000" />
          <Text style={styles.addText}>この日に予定を追加</Text>
        </TouchableOpacity>
      </View>
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
  headerTitle: { color: "#F4F4F4", fontSize: 17, fontWeight: "700" },
  weekHeader: { flexDirection: "row" },
  weekHeaderText: {
    flex: 1,
    textAlign: "center",
    color: "#A1A1AA",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
  },
  loading: { marginVertical: 40 },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  cell: {
    width: `${100 / 7}%`,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 4,
  },
  cellActive: {
    backgroundColor: "rgba(208,128,0,0.15)",
    borderRadius: 8,
  },
  cellDay: { color: "#F4F4F4", fontSize: 14 },
  cellDayActive: { fontWeight: "700" },
  cellToday: { color: "#d08000", fontWeight: "700" },
  dotRow: { flexDirection: "row", gap: 3, marginTop: 4, height: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  detail: {
    marginTop: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#4A4A4A",
    paddingTop: 16,
  },
  detailDate: {
    color: "#F4F4F4",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 10,
  },
  detailEmpty: { color: "#71717A", fontSize: 13 },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
  },
  detailTitle: { color: "#F4F4F4", fontSize: 14, flex: 1 },
  addRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d08000",
    backgroundColor: "rgba(208,128,0,0.08)",
  },
  addText: { color: "#d08000", fontSize: 13, fontWeight: "700" },
});

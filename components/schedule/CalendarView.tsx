import type { CalendarEntry } from "../../types/plan";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { eventTypeMeta } from "@constants/schedule";
import { useCalendar } from "@hooks/usePlans";
import { formatJaFullDate } from "@utils/formatDate";
import { addDays, fromIsoDate, toIsoDate, todayIso } from "@utils/planDate";

type ViewMode = "month" | "week" | "day";

const WEEKDAY_HEADER = ["日", "月", "火", "水", "木", "金", "土"];
const VIEW_MODES: { value: ViewMode; label: string }[] = [
  { value: "month", label: "月" },
  { value: "week", label: "週" },
  { value: "day", label: "日" },
];
const pad = (value: number): string => String(value).padStart(2, "0");

/** iso を含む週の日曜日を返す（週の起点を日曜に統一）。 */
const sundayOf = (iso: string): string =>
  addDays(iso, -fromIsoDate(iso).getDay());

const shortMonthDay = (iso: string): string => {
  const date = fromIsoDate(iso);
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

/**
 * 月/週/日カレンダー表示。
 * 練習プラン画面（(menu-set)/list.tsx）のタブと、単独ルート（(schedule)/calendar.tsx）の
 * 両方から使う共通ビュー。
 */
export function CalendarView() {
  const router = useRouter();
  const [mode, setMode] = useState<ViewMode>("month");
  const [cursor, setCursor] = useState<string>(todayIso());
  const [selected, setSelected] = useState<string>(todayIso());

  const range = useMemo(() => {
    const date = fromIsoDate(cursor);
    if (mode === "month") {
      const year = date.getFullYear();
      const month = date.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      return {
        from: `${year}-${pad(month + 1)}-01`,
        to: `${year}-${pad(month + 1)}-${pad(daysInMonth)}`,
      };
    }
    if (mode === "week") {
      const sunday = sundayOf(cursor);
      return { from: sunday, to: addDays(sunday, 6) };
    }
    return { from: cursor, to: cursor };
  }, [mode, cursor]);

  const { entries, isLoading } = useCalendar(range.from, range.to);

  const byDate = useMemo(() => {
    const map = new Map<string, CalendarEntry[]>();
    for (const entry of entries) {
      const list = map.get(entry.date) ?? [];
      list.push(entry);
      map.set(entry.date, list);
    }
    return map;
  }, [entries]);

  const shift = (direction: number) => {
    if (mode === "month") {
      const date = fromIsoDate(cursor);
      setCursor(
        toIsoDate(new Date(date.getFullYear(), date.getMonth() + direction, 1)),
      );
    } else if (mode === "week") {
      setCursor(addDays(cursor, direction * 7));
    } else {
      setCursor(addDays(cursor, direction));
    }
  };

  const headerTitle = useMemo(() => {
    const date = fromIsoDate(cursor);
    if (mode === "month")
      return `${date.getFullYear()}年 ${date.getMonth() + 1}月`;
    if (mode === "week") {
      const sunday = sundayOf(cursor);
      return `${shortMonthDay(sunday)} - ${shortMonthDay(addDays(sunday, 6))}`;
    }
    return formatJaFullDate(cursor);
  }, [mode, cursor]);

  // 詳細画面はその日の文脈でメニューの済トグルを行うため、日付を引き継ぐ。
  const goEntry = (entry: CalendarEntry) =>
    router.push(`/(schedule)/${entry.schedule_id}?date=${entry.date}`);
  const goAdd = (date: string) => router.push(`/(schedule)/new?date=${date}`);

  const fabDate = mode === "month" ? selected : cursor;

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <View style={styles.segment}>
          {VIEW_MODES.map((item) => {
            const active = mode === item.value;
            return (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.segmentButton,
                  active && styles.segmentButtonActive,
                ]}
                onPress={() => setMode(item.value)}
              >
                <Text style={[styles.segmentText, active && styles.textActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.header}>
          <TouchableOpacity onPress={() => shift(-1)} hitSlop={10}>
            <Ionicons name="chevron-back" size={22} color="#F4F4F4" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{headerTitle}</Text>
          <TouchableOpacity onPress={() => shift(1)} hitSlop={10}>
            <Ionicons name="chevron-forward" size={22} color="#F4F4F4" />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <ActivityIndicator color="#d08000" style={styles.loading} />
        ) : mode === "month" ? (
          <MonthView
            cursor={cursor}
            selected={selected}
            byDate={byDate}
            onSelect={setSelected}
            onEntry={goEntry}
          />
        ) : mode === "week" ? (
          <WeekView
            cursor={cursor}
            byDate={byDate}
            onEntry={goEntry}
            onAdd={goAdd}
          />
        ) : (
          <DayView cursor={cursor} byDate={byDate} onEntry={goEntry} />
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => router.push(`/(schedule)/new?date=${fabDate}`)}
      >
        <Ionicons name="add" size={30} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

function EventChip({
  entry,
  onPress,
}: {
  entry: CalendarEntry;
  onPress: () => void;
}) {
  const meta = eventTypeMeta(entry.event_type);
  return (
    <TouchableOpacity
      style={[styles.chip, { backgroundColor: meta.color }]}
      onPress={onPress}
    >
      <Text style={styles.chipText} numberOfLines={1}>
        {entry.title ?? meta.label}
      </Text>
    </TouchableOpacity>
  );
}

function MonthView({
  cursor,
  selected,
  byDate,
  onSelect,
  onEntry,
}: {
  cursor: string;
  selected: string;
  byDate: Map<string, CalendarEntry[]>;
  onSelect: (iso: string) => void;
  onEntry: (entry: CalendarEntry) => void;
}) {
  const date = fromIsoDate(cursor);
  const year = date.getFullYear();
  const month = date.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const lead = new Date(year, month, 1).getDay();
  const cells: (number | null)[] = [
    ...Array(lead).fill(null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (number | null)[][] = [];
  for (let index = 0; index < cells.length; index += 7) {
    weeks.push(cells.slice(index, index + 7));
  }
  const isoFor = (day: number): string =>
    `${year}-${pad(month + 1)}-${pad(day)}`;
  const selectedEntries = byDate.get(selected) ?? [];

  return (
    <View>
      <View style={styles.weekHeader}>
        {WEEKDAY_HEADER.map((label) => (
          <Text key={label} style={styles.weekHeaderText}>
            {label}
          </Text>
        ))}
      </View>

      {weeks.map((week, weekIndex) => (
        <View key={weekIndex} style={styles.weekRow}>
          {week.map((day, dayIndex) => {
            if (day === null) {
              return (
                <View key={`blank-${dayIndex}`} style={styles.monthCell} />
              );
            }
            const iso = isoFor(day);
            const dayEntries = byDate.get(iso) ?? [];
            const active = iso === selected;
            const isToday = iso === todayIso();
            return (
              <TouchableOpacity
                key={iso}
                style={[styles.monthCell, active && styles.monthCellActive]}
                onPress={() => onSelect(iso)}
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
                {dayEntries.slice(0, 3).map((entry, entryIndex) => (
                  <EventChip
                    key={`${entry.schedule_id}-${entryIndex}`}
                    entry={entry}
                    onPress={() => onEntry(entry)}
                  />
                ))}
                {dayEntries.length > 3 ? (
                  <Text style={styles.moreText}>+{dayEntries.length - 3}</Text>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}

      <View style={styles.detail}>
        <Text style={styles.detailDate}>{formatJaFullDate(selected)}</Text>
        {selectedEntries.length === 0 ? (
          <Text style={styles.detailEmpty}>予定はありません</Text>
        ) : (
          selectedEntries.map((entry, index) => (
            <DetailRow
              key={`${entry.schedule_id}-${index}`}
              entry={entry}
              onPress={() => onEntry(entry)}
            />
          ))
        )}
      </View>
    </View>
  );
}

function WeekView({
  cursor,
  byDate,
  onEntry,
  onAdd,
}: {
  cursor: string;
  byDate: Map<string, CalendarEntry[]>;
  onEntry: (entry: CalendarEntry) => void;
  onAdd: (date: string) => void;
}) {
  const sunday = sundayOf(cursor);
  const days = Array.from({ length: 7 }, (_, index) => addDays(sunday, index));

  return (
    <View>
      {days.map((iso) => {
        const dayEntries = byDate.get(iso) ?? [];
        const date = fromIsoDate(iso);
        const isToday = iso === todayIso();
        return (
          <View key={iso} style={styles.weekDayRow}>
            <View style={styles.weekDayHead}>
              <Text style={[styles.weekDayLabel, isToday && styles.cellToday]}>
                {WEEKDAY_HEADER[date.getDay()]}
              </Text>
              <Text style={[styles.weekDayNum, isToday && styles.cellToday]}>
                {date.getDate()}
              </Text>
            </View>
            <View style={styles.weekDayBody}>
              {dayEntries.length === 0 ? (
                <TouchableOpacity onPress={() => onAdd(iso)}>
                  <Text style={styles.weekDayEmpty}>＋ 予定を追加</Text>
                </TouchableOpacity>
              ) : (
                dayEntries.map((entry, index) => (
                  <DetailRow
                    key={`${entry.schedule_id}-${index}`}
                    entry={entry}
                    onPress={() => onEntry(entry)}
                  />
                ))
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

function DayView({
  cursor,
  byDate,
  onEntry,
}: {
  cursor: string;
  byDate: Map<string, CalendarEntry[]>;
  onEntry: (entry: CalendarEntry) => void;
}) {
  const dayEntries = byDate.get(cursor) ?? [];
  return (
    <View style={styles.detail}>
      {dayEntries.length === 0 ? (
        <Text style={styles.detailEmpty}>予定はありません</Text>
      ) : (
        dayEntries.map((entry, index) => (
          <DetailRow
            key={`${entry.schedule_id}-${index}`}
            entry={entry}
            onPress={() => onEntry(entry)}
          />
        ))
      )}
    </View>
  );
}

function DetailRow({
  entry,
  onPress,
}: {
  entry: CalendarEntry;
  onPress: () => void;
}) {
  const meta = eventTypeMeta(entry.event_type);
  return (
    <TouchableOpacity style={styles.detailRow} onPress={onPress}>
      <View style={[styles.detailBar, { backgroundColor: meta.color }]} />
      <Text style={styles.detailTitle} numberOfLines={1}>
        {entry.title ?? meta.label}
      </Text>
      <Ionicons name="chevron-forward" size={16} color="#71717A" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#2E2E2E" },
  container: { flex: 1, backgroundColor: "#2E2E2E" },
  content: { padding: 16, paddingBottom: 96 },
  segment: {
    flexDirection: "row",
    backgroundColor: "#3A3A3A",
    borderRadius: 8,
    padding: 3,
    gap: 3,
    marginBottom: 16,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  segmentButtonActive: { backgroundColor: "#d08000" },
  segmentText: { color: "#A1A1AA", fontSize: 13, fontWeight: "600" },
  textActive: { color: "#FFFFFF" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerTitle: { color: "#F4F4F4", fontSize: 17, fontWeight: "700" },
  loading: { marginVertical: 40 },
  weekHeader: { flexDirection: "row" },
  weekHeaderText: {
    flex: 1,
    textAlign: "center",
    color: "#A1A1AA",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
  },
  weekRow: {
    flexDirection: "row",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#4A4A4A",
  },
  monthCell: {
    flex: 1,
    minHeight: 78,
    paddingTop: 4,
    paddingHorizontal: 2,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: "#4A4A4A",
    gap: 2,
  },
  monthCellActive: { backgroundColor: "rgba(208,128,0,0.12)" },
  cellDay: { color: "#F4F4F4", fontSize: 12, textAlign: "center" },
  cellDayActive: { fontWeight: "700" },
  cellToday: { color: "#d08000", fontWeight: "700" },
  chip: {
    borderRadius: 3,
    paddingHorizontal: 3,
    paddingVertical: 1,
  },
  chipText: { color: "#FFFFFF", fontSize: 9, fontWeight: "600" },
  moreText: { color: "#A1A1AA", fontSize: 9, paddingHorizontal: 3 },
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
  detailBar: { width: 4, height: 20, borderRadius: 2 },
  detailTitle: { color: "#F4F4F4", fontSize: 14, flex: 1 },
  weekDayRow: {
    flexDirection: "row",
    gap: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#4A4A4A",
    paddingVertical: 10,
  },
  weekDayHead: { width: 40, alignItems: "center", paddingTop: 2 },
  weekDayLabel: { color: "#A1A1AA", fontSize: 12, fontWeight: "600" },
  weekDayNum: { color: "#F4F4F4", fontSize: 16, fontWeight: "700" },
  weekDayBody: { flex: 1 },
  weekDayEmpty: { color: "#71717A", fontSize: 13, paddingVertical: 10 },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#d08000",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
  },
});

import type { CalendarEntry } from "../../types/plan";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import PagerView from "react-native-pager-view";
import { Icon } from "@components/icon/Icon";
import { PaywallModal } from "@components/pro/PaywallModal";
import { SkeletonList, Skeleton } from "@components/ui/Skeleton";
import { eventTypeMeta, scheduleTimeLabel } from "@constants/schedule";
import { useEntitlement } from "@hooks/useEntitlement";
import { useCalendar } from "@hooks/usePlans";
import { buildTimelineLayout, minutesFromMidnight } from "@utils/dayTimeline";
import { formatJaFullDate } from "@utils/formatDate";
import {
  addDays,
  fromIsoDate,
  mondayOf,
  toIsoDate,
  todayIso,
  weekdayNumber,
} from "@utils/planDate";

const FREE_CALENDAR_WINDOW_MONTHS = 3;

type ViewMode = "month" | "week" | "day";

const WEEKDAY_HEADER = ["月", "火", "水", "木", "金", "土", "日"];
const VIEW_MODES: { value: ViewMode; label: string }[] = [
  { value: "month", label: "月" },
  { value: "week", label: "週" },
  { value: "day", label: "日" },
];
const pad = (value: number): string => String(value).padStart(2, "0");

// 「日」表示のタイムライン。1時間ぶんの高さと、24時間ぶんの全体高さ。
const HOUR_HEIGHT = 56;
const TIMELINE_BODY_HEIGHT = 24 * HOUR_HEIGHT;
// スクロール枠は画面の残り高さいっぱいに伸ばすが、小さい端末でも最低これだけは確保する。
const TIMELINE_MIN_VIEWPORT_HEIGHT = 420;
const HOUR_LABEL_WIDTH = 48;
const HOURS = Array.from({ length: 24 }, (_, hour) => hour);
const NOW_LINE_REFRESH_MS = 60_000;
/** 時間行内のタップ位置を30分刻みに丸め、"HH:MM" として返す。 */
const slotTimeAt = (hour: number, offsetY: number): string => {
  const isLaterHalf = Number.isFinite(offsetY) && offsetY >= HOUR_HEIGHT / 2;
  return `${pad(hour)}:${isLaterHalf ? "30" : "00"}`;
};

/** 指定時刻がスクロール枠の少し上に来るオフセットを、可動域内に収めて返す。 */
const timelineOffsetFor = (minutes: number, viewportHeight: number): number => {
  const maxOffset = TIMELINE_BODY_HEIGHT - viewportHeight;
  const target = (minutes / 60) * HOUR_HEIGHT - HOUR_HEIGHT / 2;
  return Math.min(Math.max(target, 0), Math.max(maxOffset, 0));
};

const currentMinutesOfDay = (): number => {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
};

const shortMonthDay = (iso: string): string => {
  const date = fromIsoDate(iso);
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

/** 無料ユーザーの閲覧範囲(今日の前後3ヶ月)を外れているか。backのFREE_CALENDAR_WINDOW_MONTHSと揃える。 */
const isOutsideFreeWindow = (iso: string): boolean => {
  const target = fromIsoDate(iso);
  const today = fromIsoDate(todayIso());
  const lowerBound = new Date(
    today.getFullYear(),
    today.getMonth() - FREE_CALENDAR_WINDOW_MONTHS,
    today.getDate(),
  );
  const upperBound = new Date(
    today.getFullYear(),
    today.getMonth() + FREE_CALENDAR_WINDOW_MONTHS,
    today.getDate(),
  );
  return (
    target.getTime() < lowerBound.getTime() ||
    target.getTime() > upperBound.getTime()
  );
};

/**
 * 月/週/日カレンダー表示。
 * 練習プラン画面（(menu-set)/list.tsx）のタブと、単独ルート（(schedule)/calendar.tsx）の
 * 両方から使う共通ビュー。
 */
interface CalendarViewProps {
  /**
   * 横スワイプで月/週/日を切り替えるか。
   * 練習プランのタブに埋め込むときは外側のタブ送りと競合するため false にする。
   */
  swipeEnabled?: boolean;
}

export function CalendarView({ swipeEnabled = true }: CalendarViewProps) {
  const router = useRouter();
  const { hasEntitlement } = useEntitlement();
  const canViewFullHistory = hasEntitlement("schedule_calendar_full_history");
  const [mode, setMode] = useState<ViewMode>("month");
  const [cursor, setCursor] = useState<string>(todayIso());
  const [selected, setSelected] = useState<string>(todayIso());
  const [paywallOpen, setPaywallOpen] = useState(false);
  // PagerView は全ページを同時にマウントするため、開いた面だけ中身を描く。
  // 「日」表示の24時間タイムラインは重く、初期表示から積むと体感が落ちる。
  const [visited, setVisited] = useState<number[]>([0]);
  const pagerRef = useRef<PagerView>(null);

  const showPage = (index: number) => {
    // 離れた面へ飛ぶときはアニメーションで通過する面も見えるため、間の面も描く。
    const current = VIEW_MODES.findIndex((item) => item.value === mode);
    const from = Math.min(current, index);
    const to = Math.max(current, index);
    setVisited((prev) => {
      const next = new Set(prev);
      for (let page = from; page <= to; page += 1) next.add(page);
      return next.size === prev.length ? prev : [...next];
    });
    setMode(VIEW_MODES[index].value);
  };

  const selectMode = (index: number) => {
    showPage(index);
    pagerRef.current?.setPage(index);
  };

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
      const monday = mondayOf(cursor);
      return { from: monday, to: addDays(monday, 6) };
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
    const nextCursor =
      mode === "month"
        ? toIsoDate(
            new Date(
              fromIsoDate(cursor).getFullYear(),
              fromIsoDate(cursor).getMonth() + direction,
              1,
            ),
          )
        : addDays(cursor, direction * (mode === "week" ? 7 : 1));

    if (!canViewFullHistory && isOutsideFreeWindow(nextCursor)) {
      setPaywallOpen(true);
      return;
    }
    setCursor(nextCursor);
  };

  const headerTitle = useMemo(() => {
    const date = fromIsoDate(cursor);
    if (mode === "month")
      return `${date.getFullYear()}年 ${date.getMonth() + 1}月`;
    if (mode === "week") {
      const monday = mondayOf(cursor);
      return `${shortMonthDay(monday)} - ${shortMonthDay(addDays(monday, 6))}`;
    }
    return formatJaFullDate(cursor);
  }, [mode, cursor]);

  // 詳細画面はその日の文脈でメニューの済トグルを行うため、日付を引き継ぐ。
  const goEntry = (entry: CalendarEntry) =>
    router.push(`/(schedule)/${entry.schedule_id}?date=${entry.date}`);
  const goAdd = (date: string) => router.push(`/(schedule)/new?date=${date}`);
  const goAddAt = (date: string, time: string) =>
    router.push(`/(schedule)/new?date=${date}&time=${time}`);

  const fabDate = mode === "month" ? selected : cursor;

  const renderPage = (value: ViewMode) => {
    if (isLoading) return <CalendarSkeleton />;
    if (value === "month") {
      return (
        <MonthView
          cursor={cursor}
          selected={selected}
          byDate={byDate}
          onSelect={setSelected}
          onEntry={goEntry}
        />
      );
    }
    if (value === "week") {
      return (
        <WeekView
          cursor={cursor}
          byDate={byDate}
          onEntry={goEntry}
          onAdd={goAdd}
        />
      );
    }
    return (
      <DayView
        cursor={cursor}
        byDate={byDate}
        onEntry={goEntry}
        onAddAt={goAddAt}
      />
    );
  };

  return (
    <View style={styles.root}>
      <View style={styles.fixedHeader}>
        <View style={styles.segment}>
          {VIEW_MODES.map((item, index) => {
            const active = mode === item.value;
            return (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.segmentButton,
                  active && styles.segmentButtonActive,
                ]}
                onPress={() => selectMode(index)}
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
            <Icon name="chevron-back" size={22} color="#F4F4F4" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{headerTitle}</Text>
          <TouchableOpacity onPress={() => shift(1)} hitSlop={10}>
            <Icon name="chevron-forward" size={22} color="#F4F4F4" />
          </TouchableOpacity>
        </View>
      </View>

      <PagerView
        ref={pagerRef}
        style={styles.pager}
        initialPage={0}
        scrollEnabled={swipeEnabled}
        onPageSelected={(event) => showPage(event.nativeEvent.position)}
      >
        {VIEW_MODES.map((item, index) => (
          <ScrollView key={item.value} contentContainerStyle={styles.content}>
            {visited.includes(index) ? renderPage(item.value) : null}
          </ScrollView>
        ))}
      </PagerView>

      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => router.push(`/(schedule)/new?date=${fabDate}`)}
      >
        <Icon name="add" size={30} color="#FFFFFF" />
      </TouchableOpacity>

      <PaywallModal
        isOpen={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        feature="schedule_calendar_full_history"
        contextMessage="無料プランのカレンダーは今日の前後3ヶ月のみ閲覧できます"
      />
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
  const lead = weekdayNumber(new Date(year, month, 1)) - 1;
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
  const monday = mondayOf(cursor);
  const days = Array.from({ length: 7 }, (_, index) => addDays(monday, index));

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
                {WEEKDAY_HEADER[weekdayNumber(date) - 1]}
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

/** 24時間タイムライン。時刻のない予定は上部にまとめ、時刻付きは時間軸へ配置する。 */
function DayView({
  cursor,
  byDate,
  onEntry,
  onAddAt,
}: {
  cursor: string;
  byDate: Map<string, CalendarEntry[]>;
  onEntry: (entry: CalendarEntry) => void;
  onAddAt: (date: string, time: string) => void;
}) {
  const timelineRef = useRef<ScrollView>(null);
  // 実測前に暫定値でスクロールすると測定後に位置が飛ぶため、測るまでは null にしておく。
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);

  const { timed, allDay } = useMemo(() => {
    const timedEntries: { entry: CalendarEntry; minutes: number }[] = [];
    const allDayEntries: CalendarEntry[] = [];
    for (const entry of byDate.get(cursor) ?? []) {
      const minutes = entry.scheduled_time
        ? minutesFromMidnight(entry.scheduled_time)
        : null;
      if (minutes === null) allDayEntries.push(entry);
      else timedEntries.push({ entry, minutes });
    }
    return { timed: timedEntries, allDay: allDayEntries };
  }, [byDate, cursor]);
  const hasEntries = timed.length > 0 || allDay.length > 0;

  const placements = useMemo(
    () => buildTimelineLayout(timed, (item) => item.minutes),
    [timed],
  );

  const isToday = cursor === todayIso();
  // 現在時刻の線は開きっぱなしでも実時刻からずれないよう1分ごとに更新する。
  const [nowMinutes, setNowMinutes] = useState(() =>
    isToday ? currentMinutesOfDay() : null,
  );
  useEffect(() => {
    if (!isToday) {
      setNowMinutes(null);
      return;
    }
    setNowMinutes(currentMinutesOfDay());
    const timer = setInterval(
      () => setNowMinutes(currentMinutesOfDay()),
      NOW_LINE_REFRESH_MS,
    );
    return () => clearInterval(timer);
  }, [isToday]);

  // 初期スクロール位置は日付ごとに1回だけ確定させる。現在時刻を直接使うと1分ごとに
  // 再計算が走り、ユーザーがスクロールした位置を奪ってしまう。
  const scrollAnchorMinutes = useMemo(
    () => (cursor === todayIso() ? currentMinutesOfDay() : 0),
    [cursor],
  );
  const focusMinutes = placements[0]?.minutes ?? scrollAnchorMinutes;

  // 0時に張り付いたままだと当日の予定を探して長くスクロールさせることになるため、
  // 最初の予定（無ければ現在時刻）が見える位置から開始する。
  useEffect(() => {
    if (viewportHeight === null) return;
    timelineRef.current?.scrollTo({
      y: timelineOffsetFor(focusMinutes, viewportHeight),
      animated: false,
    });
  }, [cursor, focusMinutes, viewportHeight]);

  return (
    <View style={styles.dayRoot}>
      {allDay.length > 0 ? (
        <View style={styles.allDaySection}>
          <Text style={styles.allDayLabel}>終日・時間未設定</Text>
          {allDay.map((entry, index) => (
            <DetailRow
              key={`allday-${entry.schedule_id}-${index}`}
              entry={entry}
              onPress={() => onEntry(entry)}
            />
          ))}
        </View>
      ) : null}

      {hasEntries ? null : (
        <Text style={[styles.detailEmpty, styles.dayEmpty]}>
          予定はありません
        </Text>
      )}

      <ScrollView
        ref={timelineRef}
        style={styles.timeline}
        contentContainerStyle={styles.timelineContent}
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        onLayout={(event) => setViewportHeight(event.nativeEvent.layout.height)}
      >
        <View style={styles.timelineBody}>
          {HOURS.map((hour) => (
            <Pressable
              key={hour}
              style={styles.hourRow}
              accessibilityRole="button"
              accessibilityLabel={`${hour}時に予定を追加`}
              onPress={(event) =>
                onAddAt(cursor, slotTimeAt(hour, event.nativeEvent.locationY))
              }
            >
              <Text style={styles.hourLabel}>{`${pad(hour)}:00`}</Text>
              <View style={styles.hourLine} />
            </Pressable>
          ))}

          <View style={styles.timelineOverlay} pointerEvents="box-none">
            {nowMinutes === null ? null : (
              <View
                style={[
                  styles.nowLine,
                  { top: (nowMinutes / 60) * HOUR_HEIGHT },
                ]}
                pointerEvents="none"
              >
                <View style={styles.nowDot} />
                <View style={styles.nowBar} />
              </View>
            )}

            {placements.map((placement, index) => {
              const { entry } = placement.item;
              const meta = eventTypeMeta(entry.event_type);
              return (
                <TouchableOpacity
                  key={`${entry.schedule_id}-${index}`}
                  style={[
                    styles.timelineBlock,
                    {
                      top: (placement.minutes / 60) * HOUR_HEIGHT,
                      left: `${(placement.column * 100) / placement.columnCount}%`,
                      width: `${100 / placement.columnCount}%`,
                      borderLeftColor: meta.color,
                    },
                  ]}
                  onPress={() => onEntry(entry)}
                >
                  <Text style={styles.timelineBlockTime}>
                    {scheduleTimeLabel(entry.scheduled_time, entry.end_time)}
                  </Text>
                  <Text style={styles.timelineBlockTitle} numberOfLines={1}>
                    {entry.title ?? meta.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>
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
      <Icon name="chevron-forward" size={16} color="#71717A" />
    </TouchableOpacity>
  );
}

/** 月グリッドとその下の予定一覧を、実表示と同じ高さで置く。 */
function CalendarSkeleton() {
  return (
    <View style={styles.skeleton}>
      <Skeleton height={240} borderRadius={10} />
      <SkeletonList count={3} itemHeight={56} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#2E2E2E" },
  container: { flex: 1, backgroundColor: "#2E2E2E" },
  fixedHeader: { paddingHorizontal: 16, paddingTop: 16 },
  pager: { flex: 1 },
  // 「日」表示のタイムラインが画面の残り高さいっぱいに伸びるよう flexGrow を効かせる。
  content: { padding: 16, paddingBottom: 96, flexGrow: 1 },
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
  skeleton: { gap: 16, marginTop: 12 },
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
  allDaySection: {
    backgroundColor: "#3A3A3A",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 12,
  },
  allDayLabel: {
    color: "#A1A1AA",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 8,
  },
  dayRoot: { flex: 1 },
  dayEmpty: { marginBottom: 12 },
  timeline: { flex: 1, minHeight: TIMELINE_MIN_VIEWPORT_HEIGHT },
  // 00:00 のラベルは目盛り線に合わせて上へはみ出すため、枠の先頭で切れないよう余白を取る。
  timelineContent: { paddingTop: 8 },
  timelineBody: { height: TIMELINE_BODY_HEIGHT },
  hourRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    height: HOUR_HEIGHT,
  },
  hourLabel: {
    width: HOUR_LABEL_WIDTH,
    color: "#71717A",
    fontSize: 11,
    // 目盛り線と数字の中心を合わせる。
    marginTop: -6,
  },
  hourLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#4A4A4A",
  },
  timelineOverlay: {
    position: "absolute",
    top: 0,
    left: HOUR_LABEL_WIDTH,
    right: 0,
    height: TIMELINE_BODY_HEIGHT,
  },
  timelineBlock: {
    position: "absolute",
    minHeight: 40,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderLeftWidth: 4,
    borderRadius: 6,
    backgroundColor: "#424242",
  },
  timelineBlockTime: { color: "#A1A1AA", fontSize: 10, fontWeight: "600" },
  timelineBlockTitle: { color: "#F4F4F4", fontSize: 13, fontWeight: "600" },
  nowLine: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
  },
  nowDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#d08000",
  },
  nowBar: { flex: 1, height: 1, backgroundColor: "#d08000" },
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

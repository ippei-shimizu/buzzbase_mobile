import type { NoteV2 } from "../../types/note";
import type { PracticeCategory, PracticeSession } from "../../types/practice";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { UnderlineTabBar } from "@components/ui/UnderlineTabBar";
import { formatPracticeValue, menuIconForLog } from "@constants/practice";
import { useNotes } from "@hooks/useNotes";
import { usePracticeMenus } from "@hooks/usePracticeMenus";
import { usePracticeSessions } from "@hooks/usePracticeSessions";

const SEGMENTS = ["練習記録", "野球ノート"];
const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

const parseDate = (iso: string): Date => {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
};
const monthKey = (iso: string): string => iso.slice(0, 7);
// 月ラベルは常に年付き（例: 2026年7月）。
const monthLabel = (iso: string): string => {
  const [year, month] = iso.split("-").map(Number);
  return `${year}年${month}月`;
};

// 月見出しを挟みながら、日付降順のリストを描画用に並べる。
function withMonthHeaders<T extends { id: number }>(
  items: T[],
  dateOf: (item: T) => string,
): ({ header: string; key: string } | { item: T; key: string })[] {
  const rows: ({ header: string; key: string } | { item: T; key: string })[] =
    [];
  let last: string | null = null;
  items.forEach((item) => {
    const key = monthKey(dateOf(item));
    if (key !== last) {
      rows.push({ header: monthLabel(dateOf(item)), key: `h-${key}` });
      last = key;
    }
    rows.push({ item, key: `i-${item.id}` });
  });
  return rows;
}

// 未フィルタ時に1ヶ月ずつ表示するための月ページング。monthIndex 0 が最新月。
function useMonthPagination<T>(items: T[], dateOf: (item: T) => string) {
  const months = useMemo(() => {
    const set = new Set(items.map((item) => monthKey(dateOf(item))));
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [items, dateOf]);
  const [monthIndex, setMonthIndex] = useState(0);
  const safeIndex = Math.min(monthIndex, Math.max(0, months.length - 1));
  const currentMonth = months[safeIndex] ?? null;
  const currentItems = useMemo(
    () =>
      currentMonth
        ? items.filter((item) => monthKey(dateOf(item)) === currentMonth)
        : [],
    [items, dateOf, currentMonth],
  );
  return {
    months,
    monthIndex: safeIndex,
    setMonthIndex,
    currentItems,
    currentMonthLabel: currentMonth ? monthLabel(`${currentMonth}-01`) : "",
  };
}

// 月ナビ（◀ 前月 / 「2026年7月・N件」 / 翌月 ▶）。両端でボタンを無効化する。
function MonthPaginator({
  label,
  count,
  index,
  total,
  onChange,
}: {
  label: string;
  count: number;
  index: number;
  total: number;
  onChange: (next: number) => void;
}) {
  const atOldest = index >= total - 1;
  const atNewest = index <= 0;
  return (
    <View style={styles.monthNav}>
      <TouchableOpacity
        disabled={atOldest}
        onPress={() => onChange(index + 1)}
        accessibilityRole="button"
        accessibilityLabel="前の月"
        hitSlop={8}
      >
        <Ionicons
          name="chevron-back"
          size={22}
          color={atOldest ? "#52525B" : "#d08000"}
        />
      </TouchableOpacity>
      <Text style={styles.monthNavLabel}>
        {label}
        <Text style={styles.monthNavCount}>{`　${count}件`}</Text>
      </Text>
      <TouchableOpacity
        disabled={atNewest}
        onPress={() => onChange(index - 1)}
        accessibilityRole="button"
        accessibilityLabel="次の月"
        hitSlop={8}
      >
        <Ionicons
          name="chevron-forward"
          size={22}
          color={atNewest ? "#52525B" : "#d08000"}
        />
      </TouchableOpacity>
    </View>
  );
}

const LEVEL_FACE: ({
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
} | null)[] = [
  null,
  { icon: "sad", color: "#ef4444" },
  { icon: "sad-outline", color: "#f59e0b" },
  { icon: "happy-outline", color: "#84cc16" },
  { icon: "happy", color: "#22c55e" },
];

const pad = (value: number): string => String(value).padStart(2, "0");
const toDateString = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const dateChipLabel = (date: Date): string =>
  `${date.getMonth() + 1}/${date.getDate()}`;

// "YYYY-MM-DD" 文字列が from〜to の範囲内か（両端含む）。未指定側は制約なし。
const inDateRange = (
  iso: string,
  from: Date | null,
  to: Date | null,
): boolean => {
  if (from && iso < toDateString(from)) return false;
  if (to && iso > toDateString(to)) return false;
  return true;
};

const normalize = (value: string): string => value.trim().toLowerCase();

const sessionMatchesQuery = (
  session: PracticeSession,
  query: string,
): boolean => {
  const term = normalize(query);
  if (!term) return true;
  const haystack = [
    session.logged_on,
    session.memo ?? "",
    session.condition?.memo ?? "",
    session.condition?.mood ?? "",
    ...(session.condition?.injuries ?? []).map((injury) => injury.part),
    ...session.practice_logs.map((log) => log.menu_name),
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(term);
};

const noteMatchesQuery = (note: NoteV2, query: string): boolean => {
  const term = normalize(query);
  if (!term) return true;
  return [note.date, note.title ?? "", note.memo_preview]
    .join(" ")
    .toLowerCase()
    .includes(term);
};

function RecordSearchBar({
  query,
  onQueryChange,
  fromDate,
  toDate,
  onFromChange,
  onToChange,
  placeholder,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  fromDate: Date | null;
  toDate: Date | null;
  onFromChange: (value: Date | null) => void;
  onToChange: (value: Date | null) => void;
  placeholder: string;
}) {
  const [picker, setPicker] = useState<null | "from" | "to">(null);
  const hasDate = fromDate != null || toDate != null;

  return (
    <View style={styles.searchWrap}>
      <View style={styles.searchBox}>
        <Ionicons name="search" size={16} color="#A1A1AA" />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={onQueryChange}
          placeholder={placeholder}
          placeholderTextColor="#71717A"
          returnKeyType="search"
        />
        {query ? (
          <TouchableOpacity onPress={() => onQueryChange("")}>
            <Ionicons name="close-circle" size={16} color="#71717A" />
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.dateFilterRow}>
        <TouchableOpacity
          style={styles.dateChip}
          onPress={() => setPicker((prev) => (prev === "from" ? null : "from"))}
        >
          <Ionicons name="calendar-outline" size={14} color="#d08000" />
          <Text style={styles.dateChipText}>
            {fromDate ? dateChipLabel(fromDate) : "開始日"}
          </Text>
        </TouchableOpacity>
        <Text style={styles.dateTilde}>〜</Text>
        <TouchableOpacity
          style={styles.dateChip}
          onPress={() => setPicker((prev) => (prev === "to" ? null : "to"))}
        >
          <Ionicons name="calendar-outline" size={14} color="#d08000" />
          <Text style={styles.dateChipText}>
            {toDate ? dateChipLabel(toDate) : "終了日"}
          </Text>
        </TouchableOpacity>
        {hasDate ? (
          <TouchableOpacity
            style={styles.dateClear}
            onPress={() => {
              onFromChange(null);
              onToChange(null);
              setPicker(null);
            }}
          >
            <Ionicons name="close" size={14} color="#A1A1AA" />
            <Text style={styles.dateClearText}>クリア</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {picker ? (
        <DateTimePicker
          value={(picker === "from" ? fromDate : toDate) ?? new Date()}
          mode="date"
          maximumDate={new Date()}
          themeVariant="dark"
          accentColor="#d08000"
          display={Platform.OS === "ios" ? "inline" : "default"}
          onChange={(_event, selected) => {
            if (!selected) {
              setPicker(null);
              return;
            }
            let nextFrom = fromDate;
            let nextTo = toDate;
            if (picker === "from") {
              nextFrom = selected;
              onFromChange(selected);
              // 開始日を選んだ時点で終了日が未設定なら「今日」を自動補完する
              if (!toDate) {
                nextTo = new Date();
                onToChange(nextTo);
              }
            } else {
              nextTo = selected;
              onToChange(selected);
            }
            // 開始日・終了日が両方そろったら閉じる（Android は単一選択で閉じる）
            if ((nextFrom && nextTo) || Platform.OS !== "ios") {
              setPicker(null);
            }
          }}
        />
      ) : null}
    </View>
  );
}

function NewRecordButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.newButton} onPress={onPress}>
      <Ionicons name="add" size={18} color="#FFFFFF" />
      <Text style={styles.newButtonText}>{label}</Text>
    </TouchableOpacity>
  );
}

function MonthHeader({ label }: { label: string }) {
  return <Text style={styles.monthHeader}>{label}</Text>;
}

function PracticeRow({
  session,
  hasNote,
  categoryById,
  onPress,
}: {
  session: PracticeSession;
  hasNote: boolean;
  categoryById: Map<number, PracticeCategory>;
  onPress: () => void;
}) {
  const logs = session.practice_logs;
  const condition = session.condition;
  const faceLevel = condition?.physical_level ?? condition?.fatigue_level;
  const face = faceLevel ? LEVEL_FACE[faceLevel] : null;
  const date = parseDate(session.logged_on);

  return (
    <View style={styles.tlRow}>
      <View style={styles.tlRail}>
        <Text style={styles.tlDay}>{date.getDate()}</Text>
        <Text style={styles.tlWeek}>{WEEKDAYS[date.getDay()]}</Text>
      </View>
      <TouchableOpacity style={styles.tlContent} onPress={onPress}>
        {logs.length === 0 ? (
          <Text style={styles.muted}>メニューなし</Text>
        ) : (
          <View style={styles.chipWrap}>
            {logs.map((log) => {
              const value = formatPracticeValue(log);
              const category =
                log.practice_menu_id != null
                  ? categoryById.get(log.practice_menu_id)
                  : undefined;
              return (
                <View key={log.id} style={styles.menuChip}>
                  <Ionicons
                    name={menuIconForLog(log.source, category)}
                    size={13}
                    color="#d08000"
                  />
                  <Text style={styles.chipName}>{log.menu_name}</Text>
                  {value ? <Text style={styles.chipValue}>{value}</Text> : null}
                </View>
              );
            })}
          </View>
        )}
        {face || hasNote ? (
          <View style={styles.tlMeta}>
            {face ? (
              <Ionicons name={face.icon} size={18} color={face.color} />
            ) : null}
            {hasNote ? (
              <View style={styles.noteTag}>
                <Ionicons
                  name="document-text-outline"
                  size={13}
                  color="#d08000"
                />
                <Text style={styles.noteTagText}>ノート</Text>
              </View>
            ) : null}
          </View>
        ) : null}
      </TouchableOpacity>
    </View>
  );
}

function PracticeList() {
  const router = useRouter();
  const { sessions, isLoading } = usePracticeSessions();
  const { notes } = useNotes();
  const { menus } = usePracticeMenus();

  const [query, setQuery] = useState("");
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);

  const noteSessionIds = new Set(
    notes
      .map((note) => note.practice_session_id)
      .filter((id): id is number => id != null),
  );
  const categoryById = useMemo(
    () => new Map(menus.map((menu) => [menu.id, menu.category])),
    [menus],
  );

  const isFiltered =
    query.trim() !== "" || fromDate !== null || toDate !== null;
  const filtered = sessions.filter(
    (session) =>
      sessionMatchesQuery(session, query) &&
      inDateRange(session.logged_on, fromDate, toDate),
  );
  const pager = useMonthPagination(sessions, (session) => session.logged_on);

  const renderRow = (session: PracticeSession) => (
    <PracticeRow
      key={session.id}
      session={session}
      hasNote={noteSessionIds.has(session.id)}
      categoryById={categoryById}
      onPress={() => router.push(`/(practice-record)/${session.id}`)}
    />
  );

  return (
    <>
      <NewRecordButton
        label="練習を記録"
        onPress={() => router.push("/(practice-record)/daily")}
      />
      <TouchableOpacity
        style={styles.summaryLink}
        onPress={() => router.push("/(records)/summary")}
      >
        <Ionicons name="stats-chart" size={16} color="#d08000" />
        <Text style={styles.summaryLinkText}>メニュー別の積み上げを見る</Text>
        <Ionicons name="chevron-forward" size={16} color="#d08000" />
      </TouchableOpacity>
      <RecordSearchBar
        query={query}
        onQueryChange={setQuery}
        fromDate={fromDate}
        toDate={toDate}
        onFromChange={setFromDate}
        onToChange={setToDate}
        placeholder="メニュー名・メモで検索"
      />
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#d08000" />
        </View>
      ) : sessions.length === 0 ? (
        <Text style={styles.empty}>まだ練習記録がありません</Text>
      ) : isFiltered ? (
        filtered.length === 0 ? (
          <Text style={styles.empty}>該当する練習記録がありません</Text>
        ) : (
          withMonthHeaders(filtered, (session) => session.logged_on).map(
            (row) =>
              "header" in row ? (
                <MonthHeader key={row.key} label={row.header} />
              ) : (
                renderRow(row.item)
              ),
          )
        )
      ) : (
        <>
          <MonthPaginator
            label={pager.currentMonthLabel}
            count={pager.currentItems.length}
            index={pager.monthIndex}
            total={pager.months.length}
            onChange={pager.setMonthIndex}
          />
          {pager.currentItems.map(renderRow)}
        </>
      )}
    </>
  );
}

function NoteLinkChip({ note }: { note: NoteV2 }) {
  const hasPractice =
    note.practice_session_id != null || note.practice_log_id != null;
  const hasGame = note.game_result_id != null;
  if (!hasPractice && !hasGame) return null;

  return (
    <View style={styles.linkChipRow}>
      {hasPractice ? (
        <View style={[styles.linkChip, styles.practiceChip]}>
          <Ionicons name="barbell-outline" size={12} color="#d08000" />
          <Text style={styles.practiceChipText}>練習に紐付け</Text>
        </View>
      ) : null}
      {hasGame ? (
        <View style={[styles.linkChip, styles.gameChip]}>
          <Ionicons name="baseball-outline" size={12} color="#93c5fd" />
          <Text style={styles.gameChipText}>試合に紐付け</Text>
        </View>
      ) : null}
    </View>
  );
}

function NoteRow({ note, onPress }: { note: NoteV2; onPress: () => void }) {
  const date = parseDate(note.date);
  return (
    <View style={styles.tlRow}>
      <View style={styles.tlRail}>
        <Text style={styles.tlDay}>{date.getDate()}</Text>
        <Text style={styles.tlWeek}>{WEEKDAYS[date.getDay()]}</Text>
      </View>
      <TouchableOpacity style={styles.tlContent} onPress={onPress}>
        <Text style={styles.noteTitle}>{note.title || "無題のノート"}</Text>
        {note.memo_preview ? (
          <Text style={styles.preview} numberOfLines={2}>
            {note.memo_preview}
          </Text>
        ) : null}
        <NoteLinkChip note={note} />
      </TouchableOpacity>
    </View>
  );
}

function NoteList() {
  const router = useRouter();
  const { notes, isLoading } = useNotes();

  const [query, setQuery] = useState("");
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);

  const isFiltered =
    query.trim() !== "" || fromDate !== null || toDate !== null;
  const filtered = notes.filter(
    (note) =>
      noteMatchesQuery(note, query) && inDateRange(note.date, fromDate, toDate),
  );
  const pager = useMonthPagination(notes, (note) => note.date);

  const renderRow = (note: NoteV2) => (
    <NoteRow
      key={note.id}
      note={note}
      onPress={() => router.push(`/(note)/${note.id}`)}
    />
  );

  return (
    <>
      <NewRecordButton
        label="野球ノートを記録"
        onPress={() => router.push("/(note)/new")}
      />
      <RecordSearchBar
        query={query}
        onQueryChange={setQuery}
        fromDate={fromDate}
        toDate={toDate}
        onFromChange={setFromDate}
        onToChange={setToDate}
        placeholder="タイトル・本文で検索"
      />
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#d08000" />
        </View>
      ) : notes.length === 0 ? (
        <Text style={styles.empty}>まだ野球ノートがありません</Text>
      ) : isFiltered ? (
        filtered.length === 0 ? (
          <Text style={styles.empty}>該当する野球ノートがありません</Text>
        ) : (
          withMonthHeaders(filtered, (note) => note.date).map((row) =>
            "header" in row ? (
              <MonthHeader key={row.key} label={row.header} />
            ) : (
              renderRow(row.item)
            ),
          )
        )
      ) : (
        <>
          <MonthPaginator
            label={pager.currentMonthLabel}
            count={pager.currentItems.length}
            index={pager.monthIndex}
            total={pager.months.length}
            onChange={pager.setMonthIndex}
          />
          {pager.currentItems.map(renderRow)}
        </>
      )}
    </>
  );
}

export default function RecordsScreen() {
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const [segment, setSegment] = React.useState(tab === "note" ? 1 : 0);

  return (
    <View style={styles.container}>
      <UnderlineTabBar
        options={SEGMENTS}
        selectedIndex={segment}
        onSelect={setSegment}
      />
      <ScrollView contentContainerStyle={styles.content}>
        {segment === 0 ? <PracticeList /> : <NoteList />}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#2E2E2E" },
  content: { padding: 16, paddingBottom: 40 },
  centered: { paddingVertical: 48, alignItems: "center" },
  empty: { color: "#A1A1AA", fontSize: 14, textAlign: "center", marginTop: 40 },
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#3A3A3A",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 12,
  },
  monthNavLabel: { color: "#F4F4F4", fontSize: 15, fontWeight: "700" },
  monthNavCount: { color: "#A1A1AA", fontSize: 12, fontWeight: "400" },
  newButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#d08000",
    borderRadius: 10,
    paddingVertical: 14,
    marginBottom: 16,
  },
  newButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  summaryLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    marginTop: -6,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d08000",
    backgroundColor: "rgba(208,128,0,0.08)",
  },
  summaryLinkText: { color: "#d08000", fontSize: 13, fontWeight: "700" },
  searchWrap: { marginBottom: 16 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#3A3A3A",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: { flex: 1, color: "#F4F4F4", fontSize: 15, paddingVertical: 0 },
  dateFilterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },
  dateChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#3A3A3A",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  dateChipText: { color: "#F4F4F4", fontSize: 13, fontWeight: "600" },
  dateTilde: { color: "#A1A1AA", fontSize: 13 },
  dateClear: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginLeft: "auto",
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  dateClearText: { color: "#A1A1AA", fontSize: 12, fontWeight: "600" },
  monthHeader: {
    color: "#A1A1AA",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
    marginTop: 4,
  },
  muted: { color: "#A1A1AA", fontSize: 13 },

  tlRow: { flexDirection: "row", marginBottom: 14 },
  tlRail: { width: 40, alignItems: "center", paddingTop: 4 },
  tlDay: { color: "#F4F4F4", fontSize: 20, fontWeight: "800" },
  tlWeek: { color: "#A1A1AA", fontSize: 11, fontWeight: "600", marginTop: -2 },
  tlContent: {
    flex: 1,
    backgroundColor: "#3A3A3A",
    borderRadius: 12,
    padding: 12,
    marginLeft: 8,
  },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  menuChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#2E2E2E",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  chipName: { color: "#F4F4F4", fontSize: 13, fontWeight: "600" },
  chipValue: { color: "#d08000", fontSize: 13, fontWeight: "800" },
  tlMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
  },
  noteTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  noteTagText: { color: "#d08000", fontSize: 12, fontWeight: "600" },
  noteTitle: {
    color: "#F4F4F4",
    fontSize: 16,
    fontWeight: "700",
  },
  preview: { color: "#A1A1AA", fontSize: 13, lineHeight: 19, marginTop: 4 },
  linkChipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 10,
  },
  linkChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    borderRadius: 12,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  practiceChip: { backgroundColor: "rgba(208,128,0,0.15)" },
  practiceChipText: { color: "#d08000", fontSize: 12, fontWeight: "600" },
  gameChip: { backgroundColor: "rgba(59,130,246,0.15)" },
  gameChipText: { color: "#93c5fd", fontSize: 12, fontWeight: "600" },
});

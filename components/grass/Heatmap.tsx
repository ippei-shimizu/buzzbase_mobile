import type { ActivityLog } from "../../types/activity";
import React, { useMemo, useRef, useState } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";

interface Props {
  data: ActivityLog[];
  from: string;
  to: string;
  cellSize?: number;
  scroll?: boolean;
  /** セルタップで日付・内容のキャプションを表示する（詳細画面向け）。 */
  interactive?: boolean;
  /** 月（X軸）・曜日（Y軸）ラベルを表示する（詳細画面向け）。 */
  showLabels?: boolean;
}

// L0=未記録（背景 #3A3A3A と区別できる色）→ L4=最濃緑。
const INTENSITY_COLORS = [
  "#4A4A4A",
  "#14532D",
  "#166534",
  "#16A34A",
  "#22C55E",
];

// 左の曜日ラベル（月・水・金のみ表示、GitHub 流）。
const WEEKDAY_LABELS = ["", "月", "", "水", "", "金", ""];
const WEEKDAY_COL_WIDTH = 22;

type Cell = { date: string | null; log: ActivityLog | null };

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

const pad = (value: number): string => String(value).padStart(2, "0");
const toDate = (value: string): Date => new Date(`${value}T00:00:00`);
const fmt = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/** "YYYY-MM-DD" を「2026年7月4日(火)」の年月日表記にする。 */
const formatJaDate = (iso: string): string => {
  const date = toDate(iso);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日(${WEEKDAYS[date.getDay()]})`;
};

const describe = (log: ActivityLog | null): string => {
  if (!log) return "未記録";
  const parts: string[] = [];
  if (log.practice_menu_count > 0)
    parts.push(`メニュー${log.practice_menu_count}種`);
  if (log.total_swing_count > 0) parts.push(`素振り${log.total_swing_count}本`);
  if (log.has_game) parts.push("試合");
  return parts.length > 0 ? parts.join(" / ") : "記録あり";
};

/** GitHub 風のヒートマップ。週を列、曜日を行として描く。 */
export function Heatmap({
  data,
  from,
  to,
  cellSize = 13,
  scroll = true,
  interactive = false,
  showLabels = false,
}: Props) {
  const [selected, setSelected] = useState<Cell | null>(null);

  const weeks = useMemo<Cell[][]>(() => {
    const logByDate = new Map(data.map((log) => [log.activity_date, log]));
    const start = toDate(from);
    const end = toDate(to);
    const cursor = new Date(start);
    cursor.setDate(start.getDate() - start.getDay());

    const result: Cell[][] = [];
    while (cursor <= end) {
      const column: Cell[] = [];
      for (let i = 0; i < 7; i += 1) {
        const inRange = cursor >= start && cursor <= end;
        const key = inRange ? fmt(cursor) : null;
        column.push({
          date: key,
          log: key ? (logByDate.get(key) ?? null) : null,
        });
        cursor.setDate(cursor.getDate() + 1);
      }
      result.push(column);
    }
    return result;
  }, [data, from, to]);

  const slot = cellSize + 3;

  const scrollRef = useRef<ScrollView>(null);
  const viewportWidthRef = useRef(0);
  const didAutoScrollRef = useRef(false);

  // 今日（範囲内なら今日、無ければ範囲末尾）を含む週列の index。
  const focusColumnIndex = useMemo(() => {
    const today = fmt(new Date());
    const target = today >= from && today <= to ? today : to;
    for (let index = weeks.length - 1; index >= 0; index -= 1) {
      if (weeks[index].some((cell) => cell.date === target)) return index;
    }
    return weeks.length - 1;
  }, [weeks, from, to]);

  // 初期表示で対象列がビューポート中央に来るよう一度だけ横スクロールする。
  const centerOnFocus = (offsetLeft: number) => {
    if (didAutoScrollRef.current) return;
    const viewport = viewportWidthRef.current;
    if (viewport === 0 || focusColumnIndex < 0) return;
    didAutoScrollRef.current = true;
    const columnCenter = offsetLeft + focusColumnIndex * slot + slot / 2;
    scrollRef.current?.scrollTo({
      x: Math.max(0, columnCenter - viewport / 2),
      animated: false,
    });
  };

  const autoScrollProps = (offsetLeft: number) => ({
    ref: scrollRef,
    onLayout: (event: { nativeEvent: { layout: { width: number } } }) => {
      viewportWidthRef.current = event.nativeEvent.layout.width;
      centerOnFocus(offsetLeft);
    },
    onContentSizeChange: () => centerOnFocus(offsetLeft),
  });

  // 各週列の先頭で月が変わったら、その列の上に月ラベルを出す。
  const monthLabels = useMemo(() => {
    let prevMonth = -1;
    return weeks.map((week) => {
      const firstDated = week.find((cell) => cell.date)?.date;
      if (!firstDated) return "";
      const month = toDate(firstDated).getMonth() + 1;
      if (month !== prevMonth) {
        prevMonth = month;
        return `${month}月`;
      }
      return "";
    });
  }, [weeks]);

  const renderCell = (cell: Cell, dayIndex: number) => {
    const color = cell.date
      ? (INTENSITY_COLORS[cell.log?.intensity_level ?? 0] ??
        INTENSITY_COLORS[0])
      : "transparent";
    const isSelected =
      interactive && selected?.date != null && selected.date === cell.date;
    const cellStyle = {
      width: cellSize,
      height: cellSize,
      borderRadius: 2,
      margin: 1.5,
      backgroundColor: color,
      borderWidth: isSelected ? 1.5 : 0,
      borderColor: "#F4F4F4",
    };
    if (interactive && cell.date) {
      return (
        <Pressable
          key={dayIndex}
          style={cellStyle}
          onPress={() => setSelected(cell)}
        />
      );
    }
    return <View key={dayIndex} style={cellStyle} />;
  };

  const grid = (
    <View style={styles.row}>
      {weeks.map((week, weekIndex) => (
        <View key={weekIndex} style={styles.column}>
          {week.map((cell, dayIndex) => renderCell(cell, dayIndex))}
        </View>
      ))}
    </View>
  );

  if (!showLabels && !interactive) {
    if (!scroll) return grid;
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        {...autoScrollProps(0)}
      >
        {grid}
      </ScrollView>
    );
  }

  const labelledGrid = (
    <View>
      {showLabels ? (
        <View style={[styles.monthRow, { marginLeft: WEEKDAY_COL_WIDTH }]}>
          {monthLabels.map((label, index) => (
            <Text key={index} style={[styles.monthLabel, { width: slot }]}>
              {label}
            </Text>
          ))}
        </View>
      ) : null}
      <View style={styles.row}>
        {showLabels ? (
          <View style={{ width: WEEKDAY_COL_WIDTH }}>
            {WEEKDAY_LABELS.map((label, index) => (
              <Text key={index} style={[styles.weekdayLabel, { height: slot }]}>
                {label}
              </Text>
            ))}
          </View>
        ) : null}
        {grid}
      </View>
    </View>
  );

  return (
    <View>
      {scroll ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          {...autoScrollProps(showLabels ? WEEKDAY_COL_WIDTH : 0)}
        >
          {labelledGrid}
        </ScrollView>
      ) : (
        labelledGrid
      )}
      {interactive ? (
        <Text style={styles.caption}>
          {selected?.date
            ? `${formatJaDate(selected.date)} ・ ${describe(selected.log)}`
            : "セルをタップすると日付と内容が見られます"}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row" },
  column: { flexDirection: "column" },
  monthRow: { flexDirection: "row", marginBottom: 2 },
  monthLabel: { color: "#71717A", fontSize: 9, textAlign: "left" },
  weekdayLabel: {
    color: "#71717A",
    fontSize: 9,
    textAlignVertical: "center",
  },
  caption: {
    color: "#A1A1AA",
    fontSize: 12,
    marginTop: 10,
  },
});

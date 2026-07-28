import type { ActivityLog } from "../../types/activity";
import React, { useMemo, useRef } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { formatJaFullDateWithWeekday } from "@utils/formatDate";

interface Props {
  data: ActivityLog[];
  from: string;
  to: string;
  cellSize?: number;
  scroll?: boolean;
  /** 月（X軸）・曜日（Y軸）ラベルを表示する（詳細画面向け）。 */
  showLabels?: boolean;
  /** この日付より前のセルを淡色ロック表示にする（無料ユーザーのホーム草ミニ向け）。 */
  lockedBefore?: string;
  /** ロックされたセルをタップした時に呼ぶ（Paywall表示用）。 */
  onLockedPress?: () => void;
  /** ロックされていないセルをタップした時に呼ぶ（詳細画面への遷移・日次詳細表示用）。 */
  onCellPress?: (cell: { date: string; log: ActivityLog | null }) => void;
}

// L0=未記録（背景 #3A3A3A と区別できる色）→ L4=最濃緑。
const INTENSITY_COLORS = [
  "#4A4A4A",
  "#14532D",
  "#166534",
  "#16A34A",
  "#22C55E",
];

// 実データは見せず「ここに何かある」ことだけ伝える淡いゴールド（Pro訴求のチラ見せ）。
const LOCKED_CELL_COLOR = "rgba(208, 128, 0, 0.18)";

// 左の曜日ラベル（月・水・金のみ表示、GitHub 流）。
const WEEKDAY_LABELS = ["", "月", "", "水", "", "金", ""];
const WEEKDAY_COL_WIDTH = 22;

type Cell = { date: string | null; log: ActivityLog | null };

const pad = (value: number): string => String(value).padStart(2, "0");
const toDate = (value: string): Date => new Date(`${value}T00:00:00`);
const fmt = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/** GitHub 風のヒートマップ。週を列、曜日を行として描く。 */
export function Heatmap({
  data,
  from,
  to,
  cellSize = 13,
  scroll = true,
  showLabels = false,
  lockedBefore,
  onLockedPress,
  onCellPress,
}: Props) {
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
    const isLocked = Boolean(
      cell.date && lockedBefore && cell.date < lockedBefore,
    );
    const color = !cell.date
      ? "transparent"
      : isLocked
        ? LOCKED_CELL_COLOR
        : (INTENSITY_COLORS[cell.log?.intensity_level ?? 0] ??
          INTENSITY_COLORS[0]);
    const cellStyle = {
      width: cellSize,
      height: cellSize,
      borderRadius: 2,
      margin: 1.5,
      backgroundColor: color,
    };
    if (!cell.date) {
      return <View key={dayIndex} style={cellStyle} />;
    }
    const label = formatJaFullDateWithWeekday(cell.date);
    if (isLocked) {
      return (
        <Pressable
          key={dayIndex}
          style={cellStyle}
          onPress={onLockedPress}
          accessibilityLabel={`${label}（Pro限定）`}
        />
      );
    }
    if (onCellPress) {
      const date = cell.date;
      return (
        <Pressable
          key={dayIndex}
          style={cellStyle}
          onPress={() => onCellPress({ date, log: cell.log })}
          accessibilityLabel={label}
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

  if (!showLabels) {
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
});

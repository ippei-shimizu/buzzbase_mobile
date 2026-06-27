import type { ActivityLog } from "../../types/activity";
import React, { useMemo } from "react";
import { View, ScrollView, StyleSheet } from "react-native";

interface Props {
  data: ActivityLog[];
  from: string;
  to: string;
  cellSize?: number;
  scroll?: boolean;
}

// 緑グラデーション（L0=グレー → L4=最濃緑）。
const INTENSITY_COLORS = [
  "#3A3A3A",
  "#14532D",
  "#166534",
  "#16A34A",
  "#22C55E",
];

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
}: Props) {
  const weeks = useMemo(() => {
    const intensityByDate = new Map(
      data.map((log) => [log.activity_date, log.intensity_level]),
    );
    const start = toDate(from);
    const end = toDate(to);
    // 列頭を日曜に揃える。
    const cursor = new Date(start);
    cursor.setDate(start.getDate() - start.getDay());

    const result: { date: string | null; level: number }[][] = [];
    while (cursor <= end) {
      const column: { date: string | null; level: number }[] = [];
      for (let i = 0; i < 7; i += 1) {
        const inRange = cursor >= start && cursor <= end;
        const key = inRange ? fmt(cursor) : null;
        column.push({
          date: key,
          level: key ? (intensityByDate.get(key) ?? 0) : 0,
        });
        cursor.setDate(cursor.getDate() + 1);
      }
      result.push(column);
    }
    return result;
  }, [data, from, to]);

  const grid = (
    <View style={styles.row}>
      {weeks.map((week, weekIndex) => (
        <View key={weekIndex} style={styles.column}>
          {week.map((cell, dayIndex) => (
            <View
              key={dayIndex}
              style={{
                width: cellSize,
                height: cellSize,
                borderRadius: 2,
                margin: 1.5,
                backgroundColor: cell.date
                  ? (INTENSITY_COLORS[cell.level] ?? INTENSITY_COLORS[0])
                  : "transparent",
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );

  if (!scroll) return grid;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {grid}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row" },
  column: { flexDirection: "column" },
});

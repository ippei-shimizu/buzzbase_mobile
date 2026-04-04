// mobile/components/stats/PlateAppearanceDonut.tsx
import type { PlateAppearanceCategory } from "../../types/stats";
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle, Text as SvgText } from "react-native-svg";

interface PlateAppearanceDonutProps {
  breakdown: PlateAppearanceCategory[];
  totalPlateAppearances: number;
}

const COLORS: Record<string, string> = {
  安打: "#ef4444",
  ゴロ: "#6b7280",
  フライ: "#3b82f6",
  三振: "#f59e0b",
  四死球: "#10b981",
  その他: "#8b5cf6",
};

const SIZE = 120;
const STROKE_WIDTH = 18;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export const PlateAppearanceDonut = ({
  breakdown,
  totalPlateAppearances,
}: PlateAppearanceDonutProps) => {
  let accumulatedOffset = 0;

  const segments = breakdown
    .filter((cat) => cat.count > 0)
    .map((cat) => {
      const dashLength = (cat.percentage / 100) * CIRCUMFERENCE;
      const dashGap = CIRCUMFERENCE - dashLength;
      const offset = -accumulatedOffset + CIRCUMFERENCE * 0.25; // start from top
      accumulatedOffset += dashLength;
      return {
        ...cat,
        dashArray: `${dashLength} ${dashGap}`,
        dashOffset: offset,
        color: COLORS[cat.category] || "#6b7280",
      };
    });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>打席結果の内訳</Text>
      <View style={styles.row}>
        <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="#222"
            strokeWidth={STROKE_WIDTH}
          />
          {segments.map((seg) => (
            <Circle
              key={seg.category}
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={seg.color}
              strokeWidth={STROKE_WIDTH}
              strokeDasharray={seg.dashArray}
              strokeDashoffset={seg.dashOffset}
            />
          ))}
          <SvgText
            x={SIZE / 2}
            y={SIZE / 2 - 6}
            textAnchor="middle"
            fill="#fff"
            fontSize={16}
            fontWeight="700"
          >
            {totalPlateAppearances}
          </SvgText>
          <SvgText
            x={SIZE / 2}
            y={SIZE / 2 + 10}
            textAnchor="middle"
            fill="#888"
            fontSize={9}
          >
            打席
          </SvgText>
        </Svg>

        <View style={styles.legend}>
          {breakdown.map((cat) => (
            <View key={cat.category} style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: COLORS[cat.category] || "#6b7280" },
                ]}
              />
              <Text style={styles.legendLabel}>{cat.category}</Text>
              <Text style={styles.legendValue}>{cat.percentage}%</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#111",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  title: {
    color: "#aaa",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  legend: {
    flex: 1,
    gap: 4,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    color: "#ccc",
    fontSize: 11,
    flex: 1,
  },
  legendValue: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
});

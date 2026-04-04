import type { PlateAppearanceCategory } from "../../types/stats";
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle, Text as SvgText } from "react-native-svg";

interface PlateAppearanceDonutProps {
  breakdown: PlateAppearanceCategory[];
  totalPlateAppearances: number;
}

const COLORS: Record<string, string> = {
  単打: "#f31260",
  長打: "#F54180",
  本塁打: "#FAA0BF",
  ゴロ: "#71717A",
  フライ: "#9CA3AF",
  三振: "#d08000",
  四死球: "#17C964",
  その他: "#8b5cf6",
};

const SIZE = 148;
const STROKE_WIDTH = 12;
const GAP = 3;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export const PlateAppearanceDonut = ({
  breakdown,
  totalPlateAppearances,
}: PlateAppearanceDonutProps) => {
  const activeSegments = breakdown.filter((cat) => cat.count > 0);
  const gapTotal = activeSegments.length > 1 ? activeSegments.length * GAP : 0;
  const availableCircumference = CIRCUMFERENCE - gapTotal;

  let accumulatedOffset = 0;
  const segments = activeSegments.map((cat) => {
    const dashLength = (cat.percentage / 100) * availableCircumference;
    const dashGap = CIRCUMFERENCE - dashLength;
    const offset = -accumulatedOffset + CIRCUMFERENCE * 0.25;
    accumulatedOffset += dashLength + GAP;
    return {
      ...cat,
      dashArray: `${dashLength} ${dashGap}`,
      dashOffset: offset,
      color: COLORS[cat.category] || "#71717A",
    };
  });

  const maxPercentage = Math.max(...breakdown.map((b) => b.percentage), 1);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>打席結果の内訳</Text>

      <View style={styles.chartRow}>
        {/* Donut */}
        <View style={styles.donutWrapper}>
          <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
            <Circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke="#27272a"
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
                strokeLinecap="round"
              />
            ))}
            <SvgText
              x={SIZE / 2}
              y={SIZE / 2 - 2}
              textAnchor="middle"
              fill="#F4F4F4"
              fontSize={26}
              fontWeight="800"
            >
              {totalPlateAppearances}
            </SvgText>
            <SvgText
              x={SIZE / 2}
              y={SIZE / 2 + 16}
              textAnchor="middle"
              fill="#71717A"
              fontSize={11}
              fontWeight="500"
            >
              打席
            </SvgText>
          </Svg>
        </View>

        {/* Horizontal bar legend */}
        <View style={styles.barLegend}>
          {breakdown.map((cat) => {
            const color = COLORS[cat.category] || "#71717A";
            const barWidth =
              maxPercentage > 0 ? (cat.percentage / maxPercentage) * 100 : 0;
            return (
              <View key={cat.category} style={styles.barItem}>
                <View style={styles.barHeader}>
                  <View style={styles.barLabelRow}>
                    <View style={[styles.dot, { backgroundColor: color }]} />
                    <Text style={styles.barLabel}>{cat.category}</Text>
                  </View>
                  <Text
                    style={[
                      styles.barPct,
                      { color: cat.count > 0 ? "#F4F4F4" : "#52525B" },
                    ]}
                  >
                    {cat.percentage}%
                  </Text>
                </View>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: `${barWidth}%`,
                        backgroundColor: color,
                        opacity: cat.count > 0 ? 1 : 0.2,
                      },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#3A3A3A",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  title: {
    color: "#F4F4F4",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 16,
  },
  chartRow: {
    flexDirection: "row",
    gap: 16,
  },
  donutWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  barLegend: {
    flex: 1,
    justifyContent: "center",
    gap: 6,
  },
  barItem: {
    gap: 3,
  },
  barHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  barLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  barLabel: {
    color: "#A1A1AA",
    fontSize: 11,
    fontWeight: "600",
  },
  barPct: {
    fontSize: 12,
    fontWeight: "700",
  },
  barTrack: {
    height: 4,
    backgroundColor: "#27272a",
    borderRadius: 2,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 2,
  },
});

import type { TimingBreakdownCategory } from "../../types/stats";
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle, Text as SvgText } from "react-native-svg";

interface TimingCardProps {
  breakdown: TimingBreakdownCategory[];
  total: number;
}

// timings マスタの 3 種それぞれにユニークな色。
const COLORS: Record<string, string> = {
  ドンピシャ: "#17C964",
  泳ぎ気味: "#d08000",
  遅れ気味: "#71717A",
};

const SIZE = 148;
const STROKE_WIDTH = 12;
const GAP = 3;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * タイミング別の打席比率カード。ContactQualityCard と同じドーナツ +
 * バー凡例レイアウトを採用し、見た目を統一する。
 */
export const TimingCard = ({ breakdown, total }: TimingCardProps) => {
  if (total === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>タイミング</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>対象データなし</Text>
          <Text style={styles.emptyNote}>
            新仕様で記録した打席のみが対象です
          </Text>
        </View>
      </View>
    );
  }

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
      color: COLORS[cat.label] || "#71717A",
    };
  });

  const maxPercentage = Math.max(...breakdown.map((b) => b.percentage), 1);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>タイミング</Text>
        <Text style={styles.targetCount}>対象 {total} 打席</Text>
      </View>

      <View style={styles.chartRow}>
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
                key={seg.id}
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
              {total}
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

        <View style={styles.barLegend}>
          {breakdown.map((cat) => {
            const color = COLORS[cat.label] || "#71717A";
            const barWidth =
              maxPercentage > 0 ? (cat.percentage / maxPercentage) * 100 : 0;
            return (
              <View key={cat.id} style={styles.barItem}>
                <View style={styles.barHeader}>
                  <View style={styles.barLabelRow}>
                    <View style={[styles.dot, { backgroundColor: color }]} />
                    <Text style={styles.barLabel}>{cat.label}</Text>
                  </View>
                  <Text
                    style={[
                      styles.barPct,
                      { color: cat.count > 0 ? "#F4F4F4" : "#52525B" },
                    ]}
                  >
                    {cat.percentage.toFixed(1)}%
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    color: "#F4F4F4",
    fontSize: 16,
    fontWeight: "700",
  },
  targetCount: {
    color: "#A1A1AA",
    fontSize: 11,
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
  emptyState: {
    paddingVertical: 32,
    alignItems: "center",
  },
  emptyText: {
    color: "#A1A1AA",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  emptyNote: {
    color: "#71717A",
    fontSize: 11,
  },
});

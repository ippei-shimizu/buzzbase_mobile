import React from "react";
import { View, Text, StyleSheet, type ViewStyle } from "react-native";
import Svg, { Polygon, Line, Circle, Text as SvgText } from "react-native-svg";
import type { RadarAxis } from "../../types/dashboard";

interface StatsRadarChartProps {
  data: RadarAxis[];
  color: string;
  title: string;
  style?: ViewStyle;
}

const SIZE = 240;
const CENTER = SIZE / 2;
const RADIUS = 80;
const LEVELS = 5;
const LABEL_MARGIN = 40;

const getPoint = (
  index: number,
  total: number,
  radius: number,
): { x: number; y: number } => {
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
  return {
    x: CENTER + radius * Math.cos(angle),
    y: CENTER + radius * Math.sin(angle),
  };
};

export const StatsRadarChart = ({
  data,
  color,
  title,
  style,
}: StatsRadarChartProps) => {
  if (data.length === 0) return null;

  const total = data.length;

  const gridLevels = Array.from({ length: LEVELS }, (_, i) => {
    const r = (RADIUS / LEVELS) * (i + 1);
    return Array.from({ length: total }, (_, j) => {
      const p = getPoint(j, total, r);
      return `${p.x},${p.y}`;
    }).join(" ");
  });

  const dataPoints = data
    .map((axis, i) => {
      const r = (axis.value / 100) * RADIUS;
      const p = getPoint(i, total, r);
      return `${p.x},${p.y}`;
    })
    .join(" ");

  const axisLines = Array.from({ length: total }, (_, i) =>
    getPoint(i, total, RADIUS),
  );

  const labelPositions = data.map((axis, i) => {
    const p = getPoint(i, total, RADIUS + LABEL_MARGIN);
    return { ...p, label: axis.label, rawValue: axis.rawValue };
  });

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.chartWrapper}>
        <Svg width={SIZE} height={SIZE}>
          {gridLevels.map((points, i) => (
            <Polygon
              key={`grid-${i}`}
              points={points}
              fill="none"
              stroke="#424242"
              strokeWidth={0.5}
            />
          ))}
          {axisLines.map((p, i) => (
            <Line
              key={`axis-${i}`}
              x1={CENTER}
              y1={CENTER}
              x2={p.x}
              y2={p.y}
              stroke="#424242"
              strokeWidth={0.5}
            />
          ))}
          <Polygon
            points={dataPoints}
            fill={color}
            fillOpacity={0.25}
            stroke={color}
            strokeWidth={2}
          />
          {data.map((axis, i) => {
            const r = (axis.value / 100) * RADIUS;
            const p = getPoint(i, total, r);
            return (
              <Circle key={`dot-${i}`} cx={p.x} cy={p.y} r={3} fill={color} />
            );
          })}
          {labelPositions.map((p, i) => (
            <React.Fragment key={`label-${i}`}>
              <SvgText
                x={p.x}
                y={p.y - 6}
                fill="#F4F4F4"
                fontSize={11}
                fontWeight="600"
                textAnchor="middle"
              >
                {p.label}
              </SvgText>
              <SvgText
                x={p.x}
                y={p.y + 8}
                fill="#A1A1AA"
                fontSize={10}
                textAnchor="middle"
              >
                {p.rawValue}
              </SvgText>
            </React.Fragment>
          ))}
        </Svg>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  title: {
    color: "#F4F4F4",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  chartWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
});

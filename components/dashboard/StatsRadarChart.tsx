import type { RadarAxis } from "../../types/dashboard";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  type ViewStyle,
} from "react-native";
import Svg, {
  Polygon,
  Line,
  Circle,
  Text as SvgText,
  G,
} from "react-native-svg";

interface StatsRadarChartProps {
  data: RadarAxis[];
  color: string;
  title: string;
  style?: ViewStyle;
}

const SIZE = 280;
const CENTER = SIZE / 2;
const RADIUS = 80;
const LEVELS = 5;
const LABEL_MARGIN = 30;

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
  const [tooltipIndex, setTooltipIndex] = useState<number | null>(null);

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
    return { ...p, label: axis.label, metric: axis.metric };
  });

  const handleLabelPress = (index: number) => {
    setTooltipIndex((prev) => (prev === index ? null : index));
  };

  const dismissTooltip = () => {
    if (tooltipIndex !== null) setTooltipIndex(null);
  };

  const chartContent = (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.chartWrapper}>
        <Svg width={SIZE} height={SIZE}>
          {gridLevels.map((points, i) => (
            <Polygon
              key={`grid-${i}`}
              points={points}
              fill="none"
              stroke="#71717A"
              strokeWidth={0.8}
            />
          ))}
          {axisLines.map((p, i) => (
            <Line
              key={`axis-${i}`}
              x1={CENTER}
              y1={CENTER}
              x2={p.x}
              y2={p.y}
              stroke="#71717A"
              strokeWidth={0.8}
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
          {labelPositions.map((p, i) => {
            const labelWidth = data[i].label.length * 12;
            return (
              <G key={`label-${i}`} onPress={() => handleLabelPress(i)}>
                <SvgText
                  x={p.x}
                  y={p.y - 6}
                  fill="#F4F4F4"
                  fontSize={12}
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {p.label}
                </SvgText>
                <Line
                  x1={p.x - labelWidth / 2}
                  y1={p.y - 4}
                  x2={p.x + labelWidth / 2}
                  y2={p.y - 4}
                  stroke="#A1A1AA"
                  strokeWidth={0.8}
                />
                <SvgText
                  x={p.x}
                  y={p.y + 8}
                  fill="#A1A1AA"
                  fontSize={10}
                  textAnchor="middle"
                >
                  {p.metric}
                </SvgText>
              </G>
            );
          })}
        </Svg>

        {labelPositions.map((p, i) => {
          const isTop = p.y < CENTER;
          const isLeft = p.x < CENTER - 20;
          const isRight = p.x > CENTER + 20;

          const tooltipPos: ViewStyle = {
            position: "absolute" as const,
            top: isTop ? p.y - 70 : p.y - 40,
            ...(isLeft
              ? { left: 0 }
              : isRight
                ? { right: 0 }
                : { left: p.x - 100 }),
            width: 200,
          };

          return (
            <React.Fragment key={`touch-${i}`}>
              <TouchableOpacity
                style={[
                  styles.labelTouchArea,
                  { left: p.x - 36, top: p.y - 16 },
                ]}
                onPress={() => handleLabelPress(i)}
                activeOpacity={0.7}
              />
              {tooltipIndex === i && data[i] && (
                <View style={[styles.tooltip, tooltipPos]}>
                  <Text style={styles.tooltipLabel}>
                    {data[i].label}（{data[i].metric}）
                  </Text>
                  <Text style={styles.tooltipValue}>{data[i].rawValue}</Text>
                  <Text style={styles.tooltipDesc}>{data[i].description}</Text>
                </View>
              )}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );

  if (tooltipIndex !== null) {
    return (
      <TouchableWithoutFeedback onPress={dismissTooltip}>
        <View>{chartContent}</View>
      </TouchableWithoutFeedback>
    );
  }

  return chartContent;
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  title: {
    color: "#F4F4F4",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  chartWrapper: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    width: SIZE,
    height: SIZE,
  },
  labelTouchArea: {
    position: "absolute",
    width: 72,
    height: 32,
  },
  tooltip: {
    backgroundColor: "#3A3A3A",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#525252",
    zIndex: 10,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  tooltipLabel: {
    color: "#F4F4F4",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 2,
  },
  tooltipValue: {
    color: "#d08000",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  tooltipDesc: {
    color: "#A1A1AA",
    fontSize: 11,
    lineHeight: 16,
  },
});

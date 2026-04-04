import type { HitDirection } from "../../types/stats";
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, {
  Path,
  Polygon,
  Line,
  Circle,
  Text as SvgText,
  Defs,
  LinearGradient,
  Stop,
} from "react-native-svg";

interface SprayChartProps {
  directions: HitDirection[];
}

const WIDTH = 340;
const HEIGHT = 260;

// 各方向のフィールド上の座標 (x, y)
const DIRECTION_POSITIONS: Record<number, { x: number; y: number }> = {
  1: { x: 170, y: 210 }, // 投
  2: { x: 170, y: 245 }, // 捕
  3: { x: 230, y: 190 }, // 一
  4: { x: 200, y: 175 }, // 二
  5: { x: 110, y: 175 }, // 三
  6: { x: 140, y: 190 }, // 遊
  7: { x: 48, y: 140 }, // 左線
  8: { x: 65, y: 115 }, // 左
  9: { x: 100, y: 85 }, // 左中
  10: { x: 170, y: 65 }, // 中
  11: { x: 240, y: 85 }, // 右中
  12: { x: 275, y: 115 }, // 右
  13: { x: 292, y: 140 }, // 右線
};

const getBubbleRadius = (count: number, maxCount: number): number => {
  if (count === 0 || maxCount === 0) return 0;
  const minR = 8;
  const maxR = 22;
  return minR + (count / maxCount) * (maxR - minR);
};

const getBubbleColor = (count: number, maxCount: number): string => {
  if (maxCount === 0) return "#6b7280";
  const ratio = count / maxCount;
  if (ratio >= 0.7) return "#ef4444";
  if (ratio >= 0.4) return "#f59e0b";
  return "#3b82f6";
};

const getBubbleOpacity = (count: number, maxCount: number): number => {
  if (maxCount === 0) return 0;
  return 0.4 + (count / maxCount) * 0.5;
};

export const SprayChart = ({ directions }: SprayChartProps) => {
  const maxCount = Math.max(...directions.map((d) => d.count), 1);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>打球分布図</Text>
      <Svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
        <Defs>
          <LinearGradient id="fieldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#1a3a1a" />
            <Stop offset="100%" stopColor="#0d1f0d" />
          </LinearGradient>
        </Defs>

        {/* Outfield arc */}
        <Path
          d={`M 15,${HEIGHT - 10} Q ${WIDTH / 2},10 ${WIDTH - 15},${HEIGHT - 10}`}
          fill="url(#fieldGrad)"
          stroke="#2a5a2a"
          strokeWidth={1.5}
        />

        {/* Infield diamond */}
        <Polygon
          points={`${WIDTH / 2},${HEIGHT - 30} ${WIDTH / 2 + 45},${HEIGHT - 70} ${WIDTH / 2},${HEIGHT - 110} ${WIDTH / 2 - 45},${HEIGHT - 70}`}
          fill="none"
          stroke="#4a3a2a"
          strokeWidth={1}
          opacity={0.4}
        />

        {/* Foul lines */}
        <Line
          x1={WIDTH / 2}
          y1={HEIGHT}
          x2={15}
          y2={70}
          stroke="#444"
          strokeWidth={0.5}
          strokeDasharray="3,3"
        />
        <Line
          x1={WIDTH / 2}
          y1={HEIGHT}
          x2={WIDTH - 15}
          y2={70}
          stroke="#444"
          strokeWidth={0.5}
          strokeDasharray="3,3"
        />

        {/* Home plate */}
        <Polygon
          points={`${WIDTH / 2},${HEIGHT - 12} ${WIDTH / 2 - 4},${HEIGHT - 6} ${WIDTH / 2},${HEIGHT} ${WIDTH / 2 + 4},${HEIGHT - 6}`}
          fill="white"
          opacity={0.6}
        />

        {/* Bubbles */}
        {directions.map((dir) => {
          const pos = DIRECTION_POSITIONS[dir.id];
          if (!pos || dir.count === 0) return null;
          const r = getBubbleRadius(dir.count, maxCount);
          const color = getBubbleColor(dir.count, maxCount);
          const opacity = getBubbleOpacity(dir.count, maxCount);
          return (
            <React.Fragment key={dir.id}>
              <Circle
                cx={pos.x}
                cy={pos.y}
                r={r}
                fill={color}
                opacity={opacity}
              />
              <SvgText
                x={pos.x}
                y={pos.y + 4}
                textAnchor="middle"
                fill="white"
                fontSize={r > 14 ? 11 : 9}
                fontWeight="700"
              >
                {dir.count}
              </SvgText>
            </React.Fragment>
          );
        })}

        {/* Labels for zero-count directions */}
        {directions.map((dir) => {
          const pos = DIRECTION_POSITIONS[dir.id];
          if (!pos || dir.count > 0) return null;
          return (
            <SvgText
              key={`label-${dir.id}`}
              x={pos.x}
              y={pos.y + 3}
              textAnchor="middle"
              fill="#555"
              fontSize={8}
            >
              {dir.label}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#0d1f0d",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  title: {
    color: "#aaa",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
  },
});

import type { HitDirection } from "../../types/stats";
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle, Line, Path, Text as SvgText } from "react-native-svg";
import {
  DIRECTION_LABEL_POSITIONS,
  DIRECTION_LABELS,
  GROUND_CANVAS_HEIGHT,
  GROUND_CANVAS_WIDTH,
  GROUND_FIRST,
  GROUND_HOME,
  GROUND_LEFT_END,
  GROUND_OUTFIELD_RX,
  GROUND_OUTFIELD_RY,
  GROUND_RIGHT_END,
  GROUND_SECOND,
  GROUND_THIRD,
} from "@constants/groundCanvas";

interface HitDirectionTableProps {
  directions: HitDirection[];
}

const CIRCLE_RADIUS = 22;

// ブランド色 #d08000 を SSoT とし、打率の高さに応じた濃淡で塗る。
// 0.000 → 半透明（背景が透けて見える）
// 0.400+ → 完全不透明
const HEAT_BASE = { r: 0xd0, g: 0x80, b: 0x00 };
const HEAT_MAX_AVG = 0.4;

const getHeatColor = (battingAverage: number, atBats: number): string => {
  if (atBats === 0) return "rgba(82, 82, 91, 0.35)";
  const ratio = Math.min(1, Math.max(0, battingAverage / HEAT_MAX_AVG));
  // 透明度を 0.2 → 1.0 にマップして、低打率も完全透明にはしない。
  const alpha = 0.2 + 0.8 * ratio;
  return `rgba(${HEAT_BASE.r}, ${HEAT_BASE.g}, ${HEAT_BASE.b}, ${alpha.toFixed(2)})`;
};

const formatAverage = (hits: number, atBats: number): string => {
  if (atBats === 0) return "—";
  const value = hits / atBats;
  return value.toFixed(3).replace(/^0\./, ".");
};

/**
 * 方向別の打率を球場図上にヒートマップとして表示する。
 * 13 方向の位置は DIRECTION_LABEL_POSITIONS（GroundTapField と共有）を使い、
 * 色の濃さ = 打率の高さ、中央テキスト = 打率値（0打数は「—」）を示す。
 */
export const HitDirectionTable = ({ directions }: HitDirectionTableProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>方向別の打率</Text>

      <View style={styles.chartWrapper}>
        <Svg
          width={GROUND_CANVAS_WIDTH}
          height={GROUND_CANVAS_HEIGHT}
          viewBox={`0 0 ${GROUND_CANVAS_WIDTH} ${GROUND_CANVAS_HEIGHT}`}
        >
          {/* 外野フェンス輪郭（楕円） */}
          <Path
            d={`M ${GROUND_HOME.x},${GROUND_HOME.y} L ${GROUND_LEFT_END.x},${GROUND_LEFT_END.y} A ${GROUND_OUTFIELD_RX},${GROUND_OUTFIELD_RY} 0 0,1 ${GROUND_RIGHT_END.x},${GROUND_RIGHT_END.y} Z`}
            fill="none"
            stroke="#52525B"
            strokeWidth={1.2}
          />

          {/* 内野ダイヤモンド */}
          <Path
            d={`M ${GROUND_HOME.x},${GROUND_HOME.y} L ${GROUND_FIRST.x},${GROUND_FIRST.y} L ${GROUND_SECOND.x},${GROUND_SECOND.y} L ${GROUND_THIRD.x},${GROUND_THIRD.y} Z`}
            fill="none"
            stroke="#52525B"
            strokeWidth={1.2}
          />

          {/* ファウルライン */}
          <Line
            x1={GROUND_HOME.x}
            y1={GROUND_HOME.y}
            x2={GROUND_LEFT_END.x}
            y2={GROUND_LEFT_END.y}
            stroke="#3F3F46"
            strokeWidth={1}
          />
          <Line
            x1={GROUND_HOME.x}
            y1={GROUND_HOME.y}
            x2={GROUND_RIGHT_END.x}
            y2={GROUND_RIGHT_END.y}
            stroke="#3F3F46"
            strokeWidth={1}
          />

          {/* 各方向のヒートサークル */}
          {Object.entries(DIRECTION_LABELS).map(([idKey, label]) => {
            const id = Number(idKey);
            const position = DIRECTION_LABEL_POSITIONS[id];
            if (!position) return null;
            const dir = directions.find((d) => d.id === id);
            const atBats = dir?.at_bats ?? 0;
            const hits = dir?.hits ?? 0;
            const battingAverage = atBats > 0 ? hits / atBats : 0;
            const color = getHeatColor(battingAverage, atBats);

            return (
              <React.Fragment key={id}>
                <Circle
                  cx={position.x}
                  cy={position.y}
                  r={CIRCLE_RADIUS}
                  fill={color}
                  stroke="rgba(0,0,0,0.4)"
                  strokeWidth={0.6}
                />
                <SvgText
                  x={position.x}
                  y={position.y - 2}
                  textAnchor="middle"
                  fill="#F4F4F4"
                  fontSize={12}
                  fontWeight="700"
                >
                  {formatAverage(hits, atBats)}
                </SvgText>
                <SvgText
                  x={position.x}
                  y={position.y + 12}
                  textAnchor="middle"
                  fill="#E4E4E7"
                  fontSize={9}
                  fontWeight="500"
                >
                  {label}
                </SvgText>
              </React.Fragment>
            );
          })}
        </Svg>
      </View>

      {/* グラデーション凡例 */}
      <View style={styles.legendRow}>
        <Text style={styles.legendLabel}>低い</Text>
        <View style={styles.legendGradient}>
          {Array.from({ length: 12 }, (_, i) => {
            const t = i / 11;
            const alpha = 0.2 + 0.8 * t;
            return (
              <View
                key={i}
                style={[
                  styles.legendCell,
                  {
                    backgroundColor: `rgba(${HEAT_BASE.r},${HEAT_BASE.g},${HEAT_BASE.b},${alpha.toFixed(2)})`,
                  },
                ]}
              />
            );
          })}
        </View>
        <Text style={styles.legendLabel}>高い</Text>
      </View>
      <Text style={styles.note}>
        色の濃さ = 打率の高さ（.400 以上は最大濃度）/ 0打数は「—」
      </Text>
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
    marginBottom: 12,
  },
  chartWrapper: {
    alignItems: "center",
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 12,
  },
  legendLabel: {
    color: "#A1A1AA",
    fontSize: 11,
  },
  legendGradient: {
    flexDirection: "row",
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  legendCell: {
    width: 12,
    height: 8,
  },
  note: {
    color: "#71717A",
    fontSize: 11,
    textAlign: "center",
    marginTop: 6,
  },
});

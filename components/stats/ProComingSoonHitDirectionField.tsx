import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, {
  Circle,
  ClipPath,
  Defs,
  G,
  Line,
  Path,
  Polygon,
  Rect,
  Text as SvgText,
} from "react-native-svg";
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

/**
 * Pro プラン Coming soon カードのボカし背景専用の球場図。
 * 実際の HitDirectionTable と見た目を揃えつつ、production コンポーネントには
 * 一切依存しない自己完結の静的描画（タップ・凡例・カード装飾なし）。
 * Pro 本体実装時はこのファイルごと削除できる。
 */

const WIDTH = GROUND_CANVAS_WIDTH;
const HEIGHT = GROUND_CANVAS_HEIGHT;
const HOME = GROUND_HOME;
const FIRST = GROUND_FIRST;
const SECOND = GROUND_SECOND;
const THIRD = GROUND_THIRD;
const LEFT_END = GROUND_LEFT_END;
const RIGHT_END = GROUND_RIGHT_END;

const CIRCLE_RADIUS = 22;
const BOTTOM_PADDING = 28;
const SVG_HEIGHT = HEIGHT + BOTTOM_PADDING;

const STRIPE_X_POSITIONS: readonly number[] = Array.from(
  { length: 20 },
  (_, i) => -100 + i * 30,
);

const HEAT_BASE = { r: 0xd0, g: 0x80, b: 0x00 };
const HEAT_MAX_AVG = 0.4;

const getHeatColor = (battingAverage: number): string => {
  const ratio = Math.min(1, Math.max(0, battingAverage / HEAT_MAX_AVG));
  const alpha = 0.35 + 0.65 * ratio;
  return `rgba(${HEAT_BASE.r}, ${HEAT_BASE.g}, ${HEAT_BASE.b}, ${alpha.toFixed(2)})`;
};

const formatAverage = (value: number): string =>
  value.toFixed(3).replace(/^0\./, ".");

// 13 方向ぶんの打率ダミー値（色濃度が散るよう高低を散らす）。
const DUMMY_AVERAGES: Record<number, number> = {
  1: 0.25,
  2: 0.333,
  3: 0.333,
  4: 0.143,
  5: 0.417,
  6: 0.4,
  7: 0.375,
  8: 0.429,
  9: 0.4,
  10: 0.364,
  11: 0.167,
  12: 0.444,
  13: 0.333,
};

export function ProComingSoonHitDirectionField() {
  const dirtCenterX = HOME.x;
  const dirtCenterY = FIRST.y + 5;
  const dirtRadius = 68;

  return (
    <View style={styles.chartWrapper}>
      <Svg
        width={WIDTH}
        height={SVG_HEIGHT}
        viewBox={`0 0 ${WIDTH} ${SVG_HEIGHT}`}
      >
        <Defs>
          <ClipPath id="fieldClipComingSoon">
            <Path
              d={`M ${HOME.x},${HOME.y} L ${LEFT_END.x},${LEFT_END.y} A ${GROUND_OUTFIELD_RX},${GROUND_OUTFIELD_RY} 0 0,1 ${RIGHT_END.x},${RIGHT_END.y} Z`}
            />
          </ClipPath>
        </Defs>

        {/* 外野（緑の芝 + ストライプ） */}
        <G clipPath="url(#fieldClipComingSoon)">
          <Rect x={0} y={0} width={WIDTH} height={HEIGHT} fill="#4a8e32" />
          {STRIPE_X_POSITIONS.map((x, i) => (
            <Rect
              key={`stripe-${i}`}
              x={x}
              y={0}
              width={15}
              height={HEIGHT * 2}
              fill="#56a03c"
              opacity={0.5}
              transform="rotate(-45, 210, 160)"
            />
          ))}
        </G>

        <Path
          d={`M ${HOME.x},${HOME.y} L ${LEFT_END.x},${LEFT_END.y} A ${GROUND_OUTFIELD_RX},${GROUND_OUTFIELD_RY} 0 0,1 ${RIGHT_END.x},${RIGHT_END.y} Z`}
          fill="none"
          stroke="#3a7a28"
          strokeWidth={2}
        />

        {/* 内野ダート */}
        <Path
          d={`M ${dirtCenterX - dirtRadius},${dirtCenterY} A ${dirtRadius},${dirtRadius} 0 0,1 ${dirtCenterX + dirtRadius},${dirtCenterY} L ${HOME.x + 20},${HOME.y + 5} L ${HOME.x - 20},${HOME.y + 5} Z`}
          fill="#b07840"
        />

        {/* 内野の芝 */}
        <Path
          d={`M ${HOME.x},${HOME.y - 15} L ${FIRST.x - 5},${FIRST.y + 2} L ${SECOND.x},${SECOND.y + 8} L ${THIRD.x + 5},${THIRD.y + 2} Z`}
          fill="#4a8e32"
        />

        {/* ファウルライン */}
        <Line
          x1={HOME.x}
          y1={HOME.y}
          x2={LEFT_END.x}
          y2={LEFT_END.y}
          stroke="rgba(255,255,255,0.6)"
          strokeWidth={1.5}
        />
        <Line
          x1={HOME.x}
          y1={HOME.y}
          x2={RIGHT_END.x}
          y2={RIGHT_END.y}
          stroke="rgba(255,255,255,0.6)"
          strokeWidth={1.5}
        />

        {/* ベースライン */}
        <Line
          x1={HOME.x}
          y1={HOME.y - 3}
          x2={FIRST.x}
          y2={FIRST.y}
          stroke="rgba(255,255,255,0.7)"
          strokeWidth={1.5}
        />
        <Line
          x1={FIRST.x}
          y1={FIRST.y}
          x2={SECOND.x}
          y2={SECOND.y}
          stroke="rgba(255,255,255,0.7)"
          strokeWidth={1.5}
        />
        <Line
          x1={SECOND.x}
          y1={SECOND.y}
          x2={THIRD.x}
          y2={THIRD.y}
          stroke="rgba(255,255,255,0.7)"
          strokeWidth={1.5}
        />
        <Line
          x1={THIRD.x}
          y1={THIRD.y}
          x2={HOME.x}
          y2={HOME.y - 3}
          stroke="rgba(255,255,255,0.7)"
          strokeWidth={1.5}
        />

        {/* マウンド */}
        <Circle
          cx={HOME.x}
          cy={(HOME.y + SECOND.y) / 2 + 5}
          r={9}
          fill="#9a6d3a"
        />
        <Rect
          x={HOME.x - 3}
          y={(HOME.y + SECOND.y) / 2 + 3}
          width={6}
          height={2}
          rx={1}
          fill="#c4a070"
        />

        {/* ベース */}
        <Polygon
          points={`${HOME.x},${HOME.y - 8} ${HOME.x - 6},${HOME.y - 3} ${HOME.x - 4},${HOME.y + 2} ${HOME.x + 4},${HOME.y + 2} ${HOME.x + 6},${HOME.y - 3}`}
          fill="white"
        />
        <Rect
          x={FIRST.x - 4}
          y={FIRST.y - 4}
          width={8}
          height={8}
          fill="white"
          transform={`rotate(45, ${FIRST.x}, ${FIRST.y})`}
        />
        <Rect
          x={SECOND.x - 4}
          y={SECOND.y - 4}
          width={8}
          height={8}
          fill="white"
          transform={`rotate(45, ${SECOND.x}, ${SECOND.y})`}
        />
        <Rect
          x={THIRD.x - 4}
          y={THIRD.y - 4}
          width={8}
          height={8}
          fill="white"
          transform={`rotate(45, ${THIRD.x}, ${THIRD.y})`}
        />

        {/* バッターボックス */}
        <Rect
          x={HOME.x - 15}
          y={HOME.y - 10}
          width={8}
          height={18}
          fill="none"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={0.8}
        />
        <Rect
          x={HOME.x + 7}
          y={HOME.y - 10}
          width={8}
          height={18}
          fill="none"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={0.8}
        />

        {/* キャッチャーエリア */}
        <Path
          d={`M ${HOME.x - 12},${HOME.y + 5} Q ${HOME.x},${HOME.y + 18} ${HOME.x + 12},${HOME.y + 5}`}
          fill="none"
          stroke="#9a6d3a"
          strokeWidth={3}
        />

        {/* 各方向のヒートサークル（ダミー） */}
        {Object.entries(DIRECTION_LABELS).map(([idKey, label]) => {
          const id = Number(idKey);
          const position = DIRECTION_LABEL_POSITIONS[id];
          if (!position) return null;
          const battingAverage = DUMMY_AVERAGES[id] ?? 0;

          return (
            <React.Fragment key={id}>
              <Circle
                cx={position.x}
                cy={position.y}
                r={CIRCLE_RADIUS + 1}
                fill="black"
                opacity={0.25}
              />
              <Circle
                cx={position.x}
                cy={position.y}
                r={CIRCLE_RADIUS}
                fill={getHeatColor(battingAverage)}
                stroke="rgba(255,255,255,0.6)"
                strokeWidth={0.8}
              />
              <SvgText
                x={position.x}
                y={position.y - 2}
                textAnchor="middle"
                fill="#F4F4F4"
                fontSize={12}
                fontWeight="700"
              >
                {formatAverage(battingAverage)}
              </SvgText>
              <SvgText
                x={position.x}
                y={position.y + 12}
                textAnchor="middle"
                fill="#F4F4F4"
                fontSize={9}
                fontWeight="600"
              >
                {label}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  chartWrapper: {
    alignItems: "center",
  },
});

import type {
  HitDirection,
  HitLocationPoint,
  HomeRunDirection,
} from "../../types/stats";
import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import Svg, {
  Path,
  Rect,
  Polygon,
  Line,
  Circle,
  Text as SvgText,
  Defs,
  ClipPath,
  G,
} from "react-native-svg";
import {
  DIRECTION_LABEL_POSITIONS,
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

export type SprayChartMode = "scatter" | "bubbles";

interface SprayChartProps {
  directions: HitDirection[];
  homeRuns: HomeRunDirection[];
  mode?: SprayChartMode;
  onModeChange?: (mode: SprayChartMode) => void;
  points?: HitLocationPoint[];
}

// 絶対座標プロット時のカテゴリ別カラー
const SCATTER_COLORS: Record<HitLocationPoint["category"], string> = {
  hit: "#f31260",
  out: "#71717A",
  other: "#d08000",
};

const WIDTH = GROUND_CANVAS_WIDTH;
const HEIGHT = GROUND_CANVAS_HEIGHT;

// 球場形状は GroundTapField（打席記録 UI）と共通の座標系を使う。
// 保存済みの hit_location_x/y がタップ時と同じ位置に描画される。
const HOME = GROUND_HOME;
const FIRST = GROUND_FIRST;
const SECOND = GROUND_SECOND;
const THIRD = GROUND_THIRD;
const OUTFIELD_RX = GROUND_OUTFIELD_RX;
const OUTFIELD_RY = GROUND_OUTFIELD_RY;
const LEFT_END = GROUND_LEFT_END;
const RIGHT_END = GROUND_RIGHT_END;

// バブル位置は GroundTapField のラベル位置 (DIRECTION_LABEL_POSITIONS) に揃え、
// 両画面で同じ方向ラベルが同じ場所に置かれるようにする。
const DIRECTION_POSITIONS = DIRECTION_LABEL_POSITIONS;

// 本塁打バブルは外野フェンス（楕円）の少し外側に配置する。
const HR_OFFSET = 25;
const getHrPosition = (dirId: number): { x: number; y: number } | null => {
  const angles: Record<number, number> = {
    7: 135, // 左線
    8: 126, // 左
    9: 113, // 左中
    10: 90, // 中
    11: 67, // 右中
    12: 54, // 右
    13: 45, // 右線
  };
  const deg = angles[dirId];
  if (deg === undefined) return null;
  const rad = (deg * Math.PI) / 180;
  // 楕円外野フェンスの少し外側 (rx+offset, ry+offset)
  const rx = OUTFIELD_RX + HR_OFFSET;
  const ry = OUTFIELD_RY + HR_OFFSET;
  return {
    x: HOME.x + rx * Math.cos(rad),
    y: HOME.y - ry * Math.sin(rad),
  };
};

const getBubbleRadius = (count: number, maxCount: number): number => {
  if (count === 0 || maxCount === 0) return 0;
  return 8 + (count / maxCount) * 14;
};

// 打席結果内訳と同じカラー
const CATEGORY_COLORS: Record<string, string> = {
  単打: "#f31260",
  長打: "#F54180",
  本塁打: "#FAA0BF",
  ゴロ: "#71717A",
  フライ: "#9CA3AF",
  三振: "#d08000",
  四死球: "#17C964",
  その他: "#8b5cf6",
};

const getBubbleColor = (topCategory: string): string => {
  return CATEGORY_COLORS[topCategory] || "#71717A";
};

const getBubbleOpacity = (count: number, maxCount: number): number => {
  if (maxCount === 0) return 0;
  return 0.5 + (count / maxCount) * 0.4;
};

export const SprayChart = ({
  directions,
  homeRuns = [],
  mode = "scatter",
  onModeChange,
  points = [],
}: SprayChartProps) => {
  const allCounts = [
    ...directions.map((d) => d.count),
    ...homeRuns.map((h) => h.count),
  ];
  const maxCount = Math.max(...allCounts, 1);

  const isScatter = mode === "scatter";

  // ダート半円の中心とサイズ
  const dirtCenterX = HOME.x;
  const dirtCenterY = FIRST.y + 5; // 1塁3塁の少し下
  const dirtRadius = 68;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>打球分布図</Text>
        {onModeChange && (
          <View style={styles.toggle}>
            <Pressable
              onPress={() => onModeChange("scatter")}
              style={[styles.toggleButton, isScatter && styles.toggleActive]}
            >
              <Text
                style={[
                  styles.toggleText,
                  isScatter && styles.toggleTextActive,
                ]}
              >
                点プロット
              </Text>
            </Pressable>
            <Pressable
              onPress={() => onModeChange("bubbles")}
              style={[styles.toggleButton, !isScatter && styles.toggleActive]}
            >
              <Text
                style={[
                  styles.toggleText,
                  !isScatter && styles.toggleTextActive,
                ]}
              >
                バブル
              </Text>
            </Pressable>
          </View>
        )}
      </View>
      <View style={styles.chartWrapper}>
        <Svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
          <Defs>
            {/* 外野形状クリップ（円弧） */}
            <ClipPath id="fieldClip">
              <Path
                d={`M ${HOME.x},${HOME.y} L ${LEFT_END.x},${LEFT_END.y} A ${OUTFIELD_RX},${OUTFIELD_RY} 0 0,1 ${RIGHT_END.x},${RIGHT_END.y} Z`}
              />
            </ClipPath>
          </Defs>

          {/* ===== 外野（緑の芝 + ストライプ） ===== */}
          <G clipPath="url(#fieldClip)">
            <Rect x={0} y={0} width={WIDTH} height={HEIGHT} fill="#4a8e32" />
            {/* 斜めストライプ */}
            {Array.from({ length: 20 }, (_, i) => (
              <Rect
                key={`stripe-${i}`}
                x={-100 + i * 30}
                y={0}
                width={15}
                height={HEIGHT * 2}
                fill="#56a03c"
                opacity={0.5}
                transform="rotate(-45, 210, 160)"
              />
            ))}
          </G>

          {/* 外野の輪郭線 */}
          <Path
            d={`M ${HOME.x},${HOME.y} L ${LEFT_END.x},${LEFT_END.y} A ${OUTFIELD_RX},${OUTFIELD_RY} 0 0,1 ${RIGHT_END.x},${RIGHT_END.y} Z`}
            fill="none"
            stroke="#3a7a28"
            strokeWidth={2}
          />

          {/* ===== 内野ダート（半円 + ホームまでの台形） ===== */}
          <Path
            d={`M ${dirtCenterX - dirtRadius},${dirtCenterY} A ${dirtRadius},${dirtRadius} 0 0,1 ${dirtCenterX + dirtRadius},${dirtCenterY} L ${HOME.x + 20},${HOME.y + 5} L ${HOME.x - 20},${HOME.y + 5} Z`}
            fill="#b07840"
          />

          {/* ===== 内野の芝（ダイヤモンド内の緑） ===== */}
          <Path
            d={`M ${HOME.x},${HOME.y - 15} L ${FIRST.x - 5},${FIRST.y + 2} L ${SECOND.x},${SECOND.y + 8} L ${THIRD.x + 5},${THIRD.y + 2} Z`}
            fill="#4a8e32"
          />
          {/* ===== ファウルライン ===== */}
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

          {/* ===== ベースライン ===== */}
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

          {/* ===== マウンド ===== */}
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

          {/* ===== ベース ===== */}
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

          {/* ===== バッターボックス ===== */}
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

          {/* ===== キャッチャーエリア ===== */}
          <Path
            d={`M ${HOME.x - 12},${HOME.y + 5} Q ${HOME.x},${HOME.y + 18} ${HOME.x + 12},${HOME.y + 5}`}
            fill="none"
            stroke="#9a6d3a"
            strokeWidth={3}
          />

          {!isScatter &&
            directions.map((dir) => {
              const pos = DIRECTION_POSITIONS[dir.id];
              if (!pos || dir.count === 0) return null;
              const r = getBubbleRadius(dir.count, maxCount);
              const color = getBubbleColor(dir.top_category);
              const opacity = getBubbleOpacity(dir.count, maxCount);
              return (
                <React.Fragment key={dir.id}>
                  <Circle
                    cx={pos.x}
                    cy={pos.y}
                    r={r + 2}
                    fill="black"
                    opacity={0.15}
                  />
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
                    fontSize={r > 14 ? 12 : 10}
                    fontWeight="700"
                  >
                    {dir.count}
                  </SvgText>
                </React.Fragment>
              );
            })}

          {!isScatter &&
            homeRuns.map((hr) => {
              const pos = getHrPosition(hr.id);
              if (!pos) return null;
              const r = getBubbleRadius(hr.count, maxCount);
              const opacity = getBubbleOpacity(hr.count, maxCount);
              return (
                <React.Fragment key={`hr-${hr.id}`}>
                  <Circle
                    cx={pos.x}
                    cy={pos.y}
                    r={r + 2}
                    fill="black"
                    opacity={0.15}
                  />
                  <Circle
                    cx={pos.x}
                    cy={pos.y}
                    r={r}
                    fill="#FAA0BF"
                    opacity={opacity}
                  />
                  <SvgText
                    x={pos.x}
                    y={pos.y + 4}
                    textAnchor="middle"
                    fill="white"
                    fontSize={r > 14 ? 12 : 10}
                    fontWeight="700"
                  >
                    {hr.count}
                  </SvgText>
                </React.Fragment>
              );
            })}

          {isScatter &&
            points.map((point, index) => (
              <Circle
                key={`point-${index}`}
                cx={point.x * WIDTH}
                cy={point.y * HEIGHT}
                r={4}
                fill={SCATTER_COLORS[point.category]}
                opacity={0.85}
                stroke="white"
                strokeWidth={0.6}
              />
            ))}
        </Svg>
      </View>

      <View style={styles.legend}>
        {isScatter
          ? (
              [
                { key: "hit", label: "安打", color: SCATTER_COLORS.hit },
                { key: "out", label: "アウト", color: SCATTER_COLORS.out },
                { key: "other", label: "その他", color: SCATTER_COLORS.other },
              ] as const
            ).map((legend) => (
              <View key={legend.key} style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: legend.color }]}
                />
                <Text style={styles.legendText}>{legend.label}</Text>
              </View>
            ))
          : ["単打", "長打", "本塁打", "ゴロ", "フライ", "三振"].map((cat) => (
              <View key={cat} style={styles.legendItem}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: CATEGORY_COLORS[cat] },
                  ]}
                />
                <Text style={styles.legendText}>{cat}</Text>
              </View>
            ))}
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
    marginBottom: 4,
  },
  title: {
    color: "#F4F4F4",
    fontSize: 16,
    fontWeight: "700",
  },
  toggle: {
    flexDirection: "row",
    backgroundColor: "#27272A",
    borderRadius: 6,
    padding: 2,
  },
  toggleButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  toggleActive: {
    backgroundColor: "#52525B",
  },
  toggleText: {
    color: "#A1A1AA",
    fontSize: 11,
    fontWeight: "600",
  },
  toggleTextActive: {
    color: "#F4F4F4",
  },
  chartWrapper: {
    alignItems: "center",
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginTop: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    color: "#A1A1AA",
    fontSize: 11,
  },
});

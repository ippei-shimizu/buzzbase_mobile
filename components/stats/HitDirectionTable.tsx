import type { HitDirection } from "../../types/stats";
import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
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

interface HitDirectionTableProps {
  directions: HitDirection[];
  /** カード装飾とタイトルを省き、球場図本体のみ描画する（Coming soon のボカし背景用）。 */
  bare?: boolean;
}

const WIDTH = GROUND_CANVAS_WIDTH;
const HEIGHT = GROUND_CANVAS_HEIGHT;
const HOME = GROUND_HOME;
const FIRST = GROUND_FIRST;
const SECOND = GROUND_SECOND;
const THIRD = GROUND_THIRD;
const LEFT_END = GROUND_LEFT_END;
const RIGHT_END = GROUND_RIGHT_END;

const CIRCLE_RADIUS = 22;

// 捕手 (id=2) のサークルが下端で見切れないよう viewBox を下方向に拡張する。
const BOTTOM_PADDING = 28;
const SVG_HEIGHT = HEIGHT + BOTTOM_PADDING;

// 球場の芝ストライプの x 位置（レンダー毎の再生成を避けて static 定数化）。
const STRIPE_X_POSITIONS: readonly number[] = Array.from(
  { length: 20 },
  (_, i) => -100 + i * 30,
);

// ブランド色 #d08000 を SSoT とし、打率の高さに応じた透明度で塗る。
const HEAT_BASE = { r: 0xd0, g: 0x80, b: 0x00 };
const HEAT_MAX_AVG = 0.4;

const getHeatColor = (battingAverage: number, atBats: number): string => {
  if (atBats === 0) return "rgba(82, 82, 91, 0.55)";
  const ratio = Math.min(1, Math.max(0, battingAverage / HEAT_MAX_AVG));
  const alpha = 0.35 + 0.65 * ratio;
  return `rgba(${HEAT_BASE.r}, ${HEAT_BASE.g}, ${HEAT_BASE.b}, ${alpha.toFixed(2)})`;
};

const formatAverage = (hits: number, atBats: number): string => {
  if (atBats === 0) return "—";
  const value = hits / atBats;
  return value.toFixed(3).replace(/^0\./, ".");
};

/**
 * 方向別の打率を球場図上にヒートマップとして表示する。
 * 球場描画は SprayChart と同一のイラストを使い、見た目を統一する。
 * 円の色濃度 = 打率の高さ、中央テキスト = 打率値（0打数は「—」）。
 */
export const HitDirectionTable = ({
  directions,
  bare = false,
}: HitDirectionTableProps) => {
  // ダート半円（SprayChart と同じ算出）
  const dirtCenterX = HOME.x;
  const dirtCenterY = FIRST.y + 5;
  const dirtRadius = 68;

  const [selectedId, setSelectedId] = useState<number | null>(null);

  const hasAnyAtBats = directions.some((dir) => dir.at_bats > 0);
  if (!hasAnyAtBats) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>方向別の打率</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>打球データなし</Text>
          <Text style={styles.emptyNote}>
            新仕様で記録した打席のみが対象です
          </Text>
        </View>
      </View>
    );
  }
  const selectedDirection = selectedId
    ? directions.find((d) => d.id === selectedId)
    : null;
  const selectedLabel = selectedId ? DIRECTION_LABELS[selectedId] : null;
  const handleCirclePress = (id: number) =>
    setSelectedId((prev) => (prev === id ? null : id));

  return (
    <View style={bare ? styles.bareContainer : styles.container}>
      {!bare && <Text style={styles.title}>方向別の打率</Text>}

      <View style={styles.chartWrapper}>
        <Svg
          width={WIDTH}
          height={SVG_HEIGHT}
          viewBox={`0 0 ${WIDTH} ${SVG_HEIGHT}`}
        >
          <Defs>
            <ClipPath id="fieldClipHeat">
              <Path
                d={`M ${HOME.x},${HOME.y} L ${LEFT_END.x},${LEFT_END.y} A ${GROUND_OUTFIELD_RX},${GROUND_OUTFIELD_RY} 0 0,1 ${RIGHT_END.x},${RIGHT_END.y} Z`}
              />
            </ClipPath>
          </Defs>

          {/* ===== 外野（緑の芝 + ストライプ） ===== */}
          <G clipPath="url(#fieldClipHeat)">
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

          {/* 外野の輪郭線 */}
          <Path
            d={`M ${HOME.x},${HOME.y} L ${LEFT_END.x},${LEFT_END.y} A ${GROUND_OUTFIELD_RX},${GROUND_OUTFIELD_RY} 0 0,1 ${RIGHT_END.x},${RIGHT_END.y} Z`}
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

          {/* ===== 各方向のヒートサークル ===== */}
          {Object.entries(DIRECTION_LABELS).map(([idKey, label]) => {
            const id = Number(idKey);
            const position = DIRECTION_LABEL_POSITIONS[id];
            if (!position) return null;
            const dir = directions.find((d) => d.id === id);
            const atBats = dir?.at_bats ?? 0;
            const hits = dir?.hits ?? 0;
            const battingAverage = atBats > 0 ? hits / atBats : 0;
            const color = getHeatColor(battingAverage, atBats);
            const isSelected = selectedId === id;

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
                  fill={color}
                  stroke={isSelected ? "#FACC15" : "rgba(255,255,255,0.6)"}
                  strokeWidth={isSelected ? 2.5 : 0.8}
                  onPress={() => handleCirclePress(id)}
                />
                <SvgText
                  x={position.x}
                  y={position.y - 2}
                  textAnchor="middle"
                  fill="#F4F4F4"
                  fontSize={12}
                  fontWeight="700"
                  onPress={() => handleCirclePress(id)}
                >
                  {formatAverage(hits, atBats)}
                </SvgText>
                <SvgText
                  x={position.x}
                  y={position.y + 12}
                  textAnchor="middle"
                  fill="#F4F4F4"
                  fontSize={9}
                  fontWeight="600"
                  onPress={() => handleCirclePress(id)}
                >
                  {label}
                </SvgText>
              </React.Fragment>
            );
          })}
        </Svg>
      </View>

      {selectedDirection && selectedLabel && (
        <View style={styles.detailCard}>
          <View style={styles.detailHeader}>
            <Text style={styles.detailTitle}>{selectedLabel} 方向</Text>
            <Pressable
              onPress={() => setSelectedId(null)}
              hitSlop={8}
              style={styles.detailClose}
            >
              <Text style={styles.detailCloseText}>✕</Text>
            </Pressable>
          </View>
          <View style={styles.detailRow}>
            <View style={styles.detailStat}>
              <Text style={styles.detailLabel}>打数</Text>
              <Text style={styles.detailValue}>
                {selectedDirection.at_bats}
              </Text>
            </View>
            <View style={styles.detailStat}>
              <Text style={styles.detailLabel}>安打</Text>
              <Text style={styles.detailValue}>{selectedDirection.hits}</Text>
            </View>
            <View style={styles.detailStat}>
              <Text style={styles.detailLabel}>打率</Text>
              <Text style={styles.detailValueHighlight}>
                {formatAverage(
                  selectedDirection.hits,
                  selectedDirection.at_bats,
                )}
              </Text>
            </View>
            <View style={styles.detailStat}>
              <Text style={styles.detailLabel}>長打率</Text>
              <Text style={styles.detailValueHighlight}>
                {formatAverage(
                  selectedDirection.total_bases,
                  selectedDirection.at_bats,
                )}
              </Text>
            </View>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailRow}>
            <View style={styles.detailStat}>
              <Text style={styles.detailLabel}>二塁打</Text>
              <Text style={styles.detailValue}>
                {selectedDirection.two_base_hit}
              </Text>
            </View>
            <View style={styles.detailStat}>
              <Text style={styles.detailLabel}>三塁打</Text>
              <Text style={styles.detailValue}>
                {selectedDirection.three_base_hit}
              </Text>
            </View>
            <View style={styles.detailStat}>
              <Text style={styles.detailLabel}>本塁打</Text>
              <Text style={styles.detailValue}>
                {selectedDirection.home_run}
              </Text>
            </View>
            <View style={styles.detailStat}>
              <Text style={styles.detailLabel}>塁打</Text>
              <Text style={styles.detailValue}>
                {selectedDirection.total_bases}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* グラデーション凡例 */}
      <View style={styles.legendRow}>
        <Text style={styles.legendLabel}>低い</Text>
        <View style={styles.legendGradient}>
          {Array.from({ length: 12 }, (_, i) => {
            const t = i / 11;
            const alpha = 0.35 + 0.65 * t;
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
  bareContainer: {},
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
  detailCard: {
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#27272A",
    borderRadius: 10,
  },
  detailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  detailTitle: {
    color: "#F4F4F4",
    fontSize: 14,
    fontWeight: "700",
  },
  detailClose: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  detailCloseText: {
    color: "#A1A1AA",
    fontSize: 14,
    fontWeight: "600",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailStat: {
    flex: 1,
    alignItems: "center",
  },
  detailLabel: {
    color: "#A1A1AA",
    fontSize: 10,
    marginBottom: 2,
  },
  detailValue: {
    color: "#F4F4F4",
    fontSize: 16,
    fontWeight: "700",
  },
  detailValueHighlight: {
    color: "#d08000",
    fontSize: 16,
    fontWeight: "700",
  },
  detailDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#3F3F46",
    marginVertical: 8,
  },
});

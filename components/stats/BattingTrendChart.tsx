import type {
  BattingTrendGranularity,
  BattingTrendPoint,
} from "../../types/stats";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableWithoutFeedback,
} from "react-native";
import Svg, {
  Path,
  Circle,
  G,
  Line,
  Rect,
  Text as SvgText,
} from "react-native-svg";

interface BattingTrendChartProps {
  points: BattingTrendPoint[];
  granularity: BattingTrendGranularity;
  onGranularityChange?: (granularity: BattingTrendGranularity) => void;
}

type LineKey =
  | "batting_average"
  | "on_base_percentage"
  | "slugging_percentage"
  | "ops";

interface LineConfig {
  key: LineKey;
  label: string;
  color: string;
}

const LINES: readonly LineConfig[] = [
  { key: "batting_average", label: "打率", color: "#d08000" },
  { key: "on_base_percentage", label: "出塁率", color: "#17C964" },
  { key: "slugging_percentage", label: "長打率", color: "#f31260" },
  { key: "ops", label: "OPS", color: "#8b5cf6" },
] as const;

const CHART_WIDTH = 320;
const CHART_HEIGHT = 180;
const PADDING_LEFT = 32;
const PADDING_RIGHT = 16;
const PADDING_TOP = 16;
const PADDING_BOTTOM = 24;
const PLOT_WIDTH = CHART_WIDTH - PADDING_LEFT - PADDING_RIGHT;
const PLOT_HEIGHT = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;

// X 軸ラベルは混雑回避のため最大 6 本に間引く。
const MAX_X_LABELS = 6;

const formatRate = (value: number): string =>
  value.toFixed(3).replace(/^0\./, ".");

/**
 * 打撃成績の推移グラフ（4 ライン: 打率 / OBP / SLG / OPS）。
 * granularity 切替で「試合（累積）」「月（月単独）」を選べる。
 * EraTrendChart の構造を流用しつつ、4 ライン重ね描きと凡例追加。
 */
export const BattingTrendChart = ({
  points,
  granularity,
  onGranularityChange,
}: BattingTrendChartProps) => {
  const [activeLines, setActiveLines] = useState<Set<LineKey>>(
    () => new Set<LineKey>(LINES.map((line) => line.key)),
  );
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const allActive = activeLines.size === LINES.length;
  const filterLabel = (() => {
    if (allActive) return "全て";
    if (activeLines.size === 0) return "なし";
    if (activeLines.size === 1) {
      const onlyKey = Array.from(activeLines)[0];
      return LINES.find((line) => line.key === onlyKey)?.label ?? "全て";
    }
    return `${activeLines.size} 件選択`;
  })();
  const toggleLine = (key: LineKey) =>
    setActiveLines((prev) => {
      const next = new Set<LineKey>(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  const selectAll = () =>
    setActiveLines(new Set<LineKey>(LINES.map((line) => line.key)));
  const visibleLines = LINES.filter((line) => activeLines.has(line.key));

  // タップしたデータポイントを記憶してツールチップを描画する。
  const [selectedDot, setSelectedDot] = useState<{
    lineKey: LineKey;
    pointIndex: number;
  } | null>(null);
  const handleDotPress = (lineKey: LineKey, pointIndex: number) =>
    setSelectedDot((prev) =>
      prev?.lineKey === lineKey && prev?.pointIndex === pointIndex
        ? null
        : { lineKey, pointIndex },
    );

  if (points.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>打撃成績の推移</Text>
          {onGranularityChange && (
            <GranularityToggle
              value={granularity}
              onChange={onGranularityChange}
            />
          )}
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>対象データなし</Text>
          <Text style={styles.emptyNote}>
            試合を記録すると推移が表示されます
          </Text>
        </View>
      </View>
    );
  }

  // 全 4 指標の最大値から Y 軸スケールを決定（OPS は 1.0 を超えるので余白）。
  // 絞り込み中も Y 軸スケールが暴れないよう、可視ラインだけでなく全 LINES を見る。
  const allValues = points.flatMap((point) =>
    LINES.map((line) => point[line.key]),
  );
  const rawMax = Math.max(...allValues, 0.5);
  const maxValue = Math.max(rawMax * 1.1, 0.5); // 上端に 10% 余白
  const minValue = 0;
  const valueRange = maxValue - minValue || 1;

  const yTicks = [0, maxValue / 3, (maxValue / 3) * 2, maxValue];

  const getX = (i: number) =>
    PADDING_LEFT +
    (points.length === 1
      ? PLOT_WIDTH / 2
      : (i / (points.length - 1)) * PLOT_WIDTH);

  const getY = (value: number) =>
    PADDING_TOP + PLOT_HEIGHT - ((value - minValue) / valueRange) * PLOT_HEIGHT;

  // 各ライン分のパスを構築（絞り込みで非アクティブなラインは含めない）。
  const linePaths = visibleLines.map((line) => ({
    ...line,
    d: points
      .map(
        (point, i) =>
          `${i === 0 ? "M" : "L"} ${getX(i)},${getY(point[line.key])}`,
      )
      .join(" "),
  }));

  // X 軸ラベルは混雑回避のため間引く。
  const labelStride = Math.max(1, Math.ceil(points.length / MAX_X_LABELS));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>打撃成績の推移</Text>
        {onGranularityChange && (
          <GranularityToggle
            value={granularity}
            onChange={onGranularityChange}
          />
        )}
      </View>

      <View style={styles.filterRow}>
        <Pressable
          onPress={() => setIsFilterOpen((prev) => !prev)}
          style={styles.filterButton}
        >
          <Text style={styles.filterButtonText}>絞り込み: {filterLabel}</Text>
          <Ionicons
            name={isFilterOpen ? "chevron-up" : "chevron-down"}
            size={14}
            color="#A1A1AA"
          />
        </Pressable>
        {isFilterOpen && (
          <>
            <TouchableWithoutFeedback onPress={() => setIsFilterOpen(false)}>
              <View style={styles.filterOverlayBg} />
            </TouchableWithoutFeedback>
            <View style={styles.filterDropdown}>
              <Pressable
                onPress={selectAll}
                style={[
                  styles.filterDropdownItem,
                  allActive && styles.filterDropdownItemActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterDropdownText,
                    allActive && styles.filterDropdownTextActive,
                  ]}
                >
                  全て表示
                </Text>
              </Pressable>
              {LINES.map((line) => {
                const isActive = activeLines.has(line.key);
                return (
                  <Pressable
                    key={line.key}
                    onPress={() => toggleLine(line.key)}
                    style={styles.filterDropdownItem}
                  >
                    <View
                      style={[
                        styles.filterDot,
                        { backgroundColor: line.color },
                      ]}
                    />
                    <Text
                      style={[
                        styles.filterDropdownText,
                        isActive && styles.filterDropdownTextActive,
                      ]}
                    >
                      {line.label}
                    </Text>
                    {isActive && <Text style={styles.filterCheck}>✓</Text>}
                  </Pressable>
                );
              })}
            </View>
          </>
        )}
      </View>

      <View style={styles.chartWrapper}>
        <Svg
          width={CHART_WIDTH}
          height={CHART_HEIGHT}
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        >
          {/* グラフ内の空白部分タップでツールチップを閉じる。
              react-native-svg は描画順 = z-index なので、後に描画される
              データポイントの onPress が優先される。 */}
          <Rect
            x={0}
            y={0}
            width={CHART_WIDTH}
            height={CHART_HEIGHT}
            fill="transparent"
            onPress={() => setSelectedDot(null)}
          />
          {yTicks.map((tick) => (
            <React.Fragment key={`y-${tick.toFixed(3)}`}>
              <Line
                x1={PADDING_LEFT}
                y1={getY(tick)}
                x2={CHART_WIDTH - PADDING_RIGHT}
                y2={getY(tick)}
                stroke="#424242"
                strokeWidth={0.5}
              />
              <SvgText
                x={PADDING_LEFT - 6}
                y={getY(tick) + 3}
                textAnchor="end"
                fill="#71717A"
                fontSize={9}
              >
                {formatRate(tick)}
              </SvgText>
            </React.Fragment>
          ))}

          {linePaths.map((line) => (
            <Path
              key={line.key}
              d={line.d}
              fill="none"
              stroke={line.color}
              strokeWidth={1.6}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {visibleLines.map((line) =>
            points.map((point, i) => {
              const isSelected =
                selectedDot?.lineKey === line.key &&
                selectedDot?.pointIndex === i;
              return (
                // 累積モードで同じ日に複数試合がある場合 point.key が重複しうるため、
                // 描画上の index を組み合わせて一意化する。
                <React.Fragment key={`pt-${line.key}-${i}`}>
                  {/* 透明な大きい円でタップヒット領域を広げる */}
                  <Circle
                    cx={getX(i)}
                    cy={getY(point[line.key])}
                    r={10}
                    fill="transparent"
                    onPress={() => handleDotPress(line.key, i)}
                  />
                  <Circle
                    cx={getX(i)}
                    cy={getY(point[line.key])}
                    r={isSelected ? 4 : 2.2}
                    fill={line.color}
                    stroke={isSelected ? "#F4F4F4" : "none"}
                    strokeWidth={isSelected ? 1.5 : 0}
                  />
                </React.Fragment>
              );
            }),
          )}

          {selectedDot &&
            (() => {
              const point = points[selectedDot.pointIndex];
              const line = LINES.find((ln) => ln.key === selectedDot.lineKey);
              if (!point || !line) return null;
              const value = point[selectedDot.lineKey];
              const cx = getX(selectedDot.pointIndex);
              const cy = getY(value);
              const tooltipWidth = 92;
              const tooltipHeight = 34;
              // 画面端で見切れないよう x / y を調整。
              let tx = cx - tooltipWidth / 2;
              if (tx < 2) tx = 2;
              if (tx + tooltipWidth > CHART_WIDTH - 2)
                tx = CHART_WIDTH - tooltipWidth - 2;
              let ty = cy - tooltipHeight - 8;
              if (ty < 2) ty = cy + 10;
              return (
                <G>
                  <Rect
                    x={tx}
                    y={ty}
                    width={tooltipWidth}
                    height={tooltipHeight}
                    rx={5}
                    fill="#27272A"
                    stroke={line.color}
                    strokeWidth={1}
                  />
                  <SvgText
                    x={tx + tooltipWidth / 2}
                    y={ty + 14}
                    textAnchor="middle"
                    fill="#F4F4F4"
                    fontSize={11}
                    fontWeight="700"
                  >
                    {`${line.label} ${formatRate(value)}`}
                  </SvgText>
                  <SvgText
                    x={tx + tooltipWidth / 2}
                    y={ty + 27}
                    textAnchor="middle"
                    fill="#A1A1AA"
                    fontSize={9}
                  >
                    {point.label}
                  </SvgText>
                </G>
              );
            })()}

          {points.map((point, i) => {
            if (i % labelStride !== 0 && i !== points.length - 1) return null;
            return (
              <SvgText
                key={`xl-${i}`}
                x={getX(i)}
                y={CHART_HEIGHT - 4}
                textAnchor="middle"
                fill="#A1A1AA"
                fontSize={9}
              >
                {point.label}
              </SvgText>
            );
          })}
        </Svg>
      </View>

      <View style={styles.legend}>
        {LINES.map((line) => {
          const isActive = activeLines.has(line.key);
          return (
            <View key={line.key} style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  {
                    backgroundColor: line.color,
                    opacity: isActive ? 1 : 0.3,
                  },
                ]}
              />
              <Text
                style={[
                  styles.legendText,
                  !isActive && styles.legendTextInactive,
                ]}
              >
                {line.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

interface GranularityToggleProps {
  value: BattingTrendGranularity;
  onChange: (value: BattingTrendGranularity) => void;
}

const GranularityToggle = ({ value, onChange }: GranularityToggleProps) => {
  const isGame = value === "game";
  return (
    <View style={styles.toggle}>
      <Pressable
        onPress={() => onChange("game")}
        style={[styles.toggleButton, isGame && styles.toggleActive]}
      >
        <Text style={[styles.toggleText, isGame && styles.toggleTextActive]}>
          試合
        </Text>
      </Pressable>
      <Pressable
        onPress={() => onChange("month")}
        style={[styles.toggleButton, !isGame && styles.toggleActive]}
      >
        <Text style={[styles.toggleText, !isGame && styles.toggleTextActive]}>
          月
        </Text>
      </Pressable>
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
    marginBottom: 12,
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
    paddingHorizontal: 12,
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
    flexWrap: "wrap",
    gap: 12,
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
  legendTextInactive: {
    color: "#52525B",
    textDecorationLine: "line-through",
  },
  filterRow: {
    marginTop: 6,
    marginBottom: 8,
    alignItems: "flex-end",
    position: "relative",
    zIndex: 10,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: "#71717b",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  filterButtonText: {
    color: "#F4F4F4",
    fontSize: 12,
    fontWeight: "500",
  },
  filterOverlayBg: {
    position: "absolute",
    top: -500,
    left: -500,
    right: -500,
    bottom: -500,
    zIndex: 15,
  },
  filterDropdown: {
    position: "absolute",
    top: 36,
    right: 0,
    minWidth: 180,
    backgroundColor: "#3A3A3A",
    borderRadius: 10,
    paddingVertical: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 20,
  },
  filterDropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  filterDropdownItemActive: {
    backgroundColor: "#4A4A4A",
  },
  filterDropdownText: {
    color: "#F4F4F4",
    fontSize: 13,
    flex: 1,
  },
  filterDropdownTextActive: {
    color: "#d08000",
    fontWeight: "600",
  },
  filterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  filterCheck: {
    color: "#d08000",
    fontSize: 14,
    fontWeight: "700",
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

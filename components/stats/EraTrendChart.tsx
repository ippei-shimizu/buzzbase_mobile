import type { EraTrendGranularity, EraTrendPoint } from "../../types/stats";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Svg, {
  Path,
  Circle,
  Line,
  Text as SvgText,
  Defs,
  LinearGradient,
  Stop,
} from "react-native-svg";

interface EraTrendChartProps {
  points: EraTrendPoint[];
  granularity: EraTrendGranularity;
  onGranularityChange?: (granularity: EraTrendGranularity) => void;
}

const CHART_WIDTH = 300;
const CHART_HEIGHT = 140;
const PADDING_LEFT = 36;
const PADDING_RIGHT = 16;
const PADDING_TOP = 16;
const PADDING_BOTTOM = 24;
const PLOT_WIDTH = CHART_WIDTH - PADDING_LEFT - PADDING_RIGHT;
const PLOT_HEIGHT = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;

const GRANULARITY_OPTIONS: readonly {
  key: EraTrendGranularity;
  label: string;
}[] = [
  { key: "month", label: "月" },
  { key: "season", label: "シーズン" },
];

const GranularityToggle = ({
  value,
  onChange,
}: {
  value: EraTrendGranularity;
  onChange: (value: EraTrendGranularity) => void;
}) => (
  <View style={styles.toggle}>
    {GRANULARITY_OPTIONS.map((option) => {
      const isActive = value === option.key;
      return (
        <Pressable
          key={option.key}
          onPress={() => onChange(option.key)}
          style={[styles.toggleButton, isActive && styles.toggleActive]}
        >
          <Text
            style={[styles.toggleText, isActive && styles.toggleTextActive]}
          >
            {option.label}
          </Text>
        </Pressable>
      );
    })}
  </View>
);

export const EraTrendChart = ({
  points,
  granularity,
  onGranularityChange,
}: EraTrendChartProps) => {
  if (points.length === 0) return null;

  const maxEra = Math.max(...points.map((p) => p.era), 1);
  const minEra = 0;
  const eraRange = maxEra - minEra || 1;

  // Y軸の目盛り
  const yTicks = [0, Math.round((maxEra / 2) * 10) / 10, Math.ceil(maxEra)];

  const getX = (i: number) =>
    PADDING_LEFT +
    (points.length === 1
      ? PLOT_WIDTH / 2
      : (i / (points.length - 1)) * PLOT_WIDTH);
  const getY = (era: number) =>
    PADDING_TOP + PLOT_HEIGHT - ((era - minEra) / eraRange) * PLOT_HEIGHT;

  // 折れ線パス
  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${getX(i)},${getY(p.era)}`)
    .join(" ");

  // エリア塗りつぶしパス
  const areaPath = `${linePath} L ${getX(points.length - 1)},${PADDING_TOP + PLOT_HEIGHT} L ${getX(0)},${PADDING_TOP + PLOT_HEIGHT} Z`;

  // 自己ベスト(ERAは低いほど良い)。シーズン粒度で複数点あるときのみ表示。
  const bestPoint =
    granularity === "season" && points.length > 1
      ? points.reduce((best, point) => (point.era < best.era ? point : best))
      : null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>防御率推移</Text>
        {onGranularityChange && (
          <GranularityToggle
            value={granularity}
            onChange={onGranularityChange}
          />
        )}
      </View>
      <View style={styles.chartWrapper}>
        <Svg
          width={CHART_WIDTH}
          height={CHART_HEIGHT}
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        >
          <Defs>
            <LinearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#006fee" stopOpacity={0.3} />
              <Stop offset="100%" stopColor="#006fee" stopOpacity={0.02} />
            </LinearGradient>
          </Defs>

          {/* Y軸グリッド線 */}
          {yTicks.map((tick) => (
            <React.Fragment key={`y-${tick}`}>
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
                fontSize={10}
              >
                {tick.toFixed(1)}
              </SvgText>
            </React.Fragment>
          ))}

          {/* エリア塗りつぶし */}
          <Path d={areaPath} fill="url(#areaGrad)" />

          {/* 折れ線 */}
          <Path
            d={linePath}
            fill="none"
            stroke="#006fee"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* データポイント */}
          {points.map((p, i) => (
            <React.Fragment key={`pt-${p.key}`}>
              <Circle cx={getX(i)} cy={getY(p.era)} r={4} fill="#006fee" />
              <Circle cx={getX(i)} cy={getY(p.era)} r={2} fill="#F4F4F4" />
            </React.Fragment>
          ))}

          {/* X軸ラベル */}
          {points.map((p, i) => (
            <SvgText
              key={`xl-${p.key}`}
              x={getX(i)}
              y={CHART_HEIGHT - 4}
              textAnchor="middle"
              fill="#A1A1AA"
              fontSize={10}
            >
              {p.label}
            </SvgText>
          ))}

          {/* データポイントの値 */}
          {points.map((p, i) => (
            <SvgText
              key={`val-${p.key}`}
              x={getX(i)}
              y={getY(p.era) - 10}
              textAnchor="middle"
              fill="#F4F4F4"
              fontSize={9}
              fontWeight="600"
            >
              {p.era.toFixed(2)}
            </SvgText>
          ))}
        </Svg>
      </View>

      {bestPoint ? (
        <View style={styles.bestRow}>
          <Ionicons name="star" size={12} color="#FFD43B" />
          <Text style={styles.bestText}>
            自己ベスト防御率 {bestPoint.era.toFixed(2)}（{bestPoint.label}）
          </Text>
        </View>
      ) : null}
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
  chartWrapper: {
    alignItems: "center",
  },
  toggle: {
    flexDirection: "row",
    backgroundColor: "#2E2E2E",
    borderRadius: 8,
    padding: 2,
    gap: 2,
  },
  toggleButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  toggleActive: {
    backgroundColor: "#006fee",
  },
  toggleText: {
    color: "#A1A1AA",
    fontSize: 11,
    fontWeight: "600",
  },
  toggleTextActive: {
    color: "#FFFFFF",
  },
  bestRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
  },
  bestText: {
    color: "#FFD43B",
    fontSize: 12,
    fontWeight: "600",
  },
});

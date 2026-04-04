import type { EraTrendPoint } from "../../types/stats";
import React from "react";
import { View, Text, StyleSheet } from "react-native";
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
  data: EraTrendPoint[];
}

const CHART_WIDTH = 300;
const CHART_HEIGHT = 140;
const PADDING_LEFT = 36;
const PADDING_RIGHT = 16;
const PADDING_TOP = 16;
const PADDING_BOTTOM = 24;
const PLOT_WIDTH = CHART_WIDTH - PADDING_LEFT - PADDING_RIGHT;
const PLOT_HEIGHT = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;

export const EraTrendChart = ({ data }: EraTrendChartProps) => {
  if (data.length === 0) return null;

  const maxEra = Math.max(...data.map((d) => d.era), 1);
  const minEra = 0;
  const eraRange = maxEra - minEra || 1;

  // Y軸の目盛り
  const yTicks = [0, Math.round((maxEra / 2) * 10) / 10, Math.ceil(maxEra)];

  const getX = (i: number) =>
    PADDING_LEFT +
    (data.length === 1 ? PLOT_WIDTH / 2 : (i / (data.length - 1)) * PLOT_WIDTH);
  const getY = (era: number) =>
    PADDING_TOP + PLOT_HEIGHT - ((era - minEra) / eraRange) * PLOT_HEIGHT;

  // 折れ線パス
  const linePath = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${getX(i)},${getY(d.era)}`)
    .join(" ");

  // エリア塗りつぶしパス
  const areaPath = `${linePath} L ${getX(data.length - 1)},${PADDING_TOP + PLOT_HEIGHT} L ${getX(0)},${PADDING_TOP + PLOT_HEIGHT} Z`;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>防御率推移</Text>
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
          {data.map((d, i) => (
            <React.Fragment key={`pt-${d.month}`}>
              <Circle cx={getX(i)} cy={getY(d.era)} r={4} fill="#006fee" />
              <Circle cx={getX(i)} cy={getY(d.era)} r={2} fill="#F4F4F4" />
            </React.Fragment>
          ))}

          {/* X軸ラベル（月） */}
          {data.map((d, i) => (
            <SvgText
              key={`xl-${d.month}`}
              x={getX(i)}
              y={CHART_HEIGHT - 4}
              textAnchor="middle"
              fill="#A1A1AA"
              fontSize={10}
            >
              {d.month}月
            </SvgText>
          ))}

          {/* データポイントの値 */}
          {data.map((d, i) => (
            <SvgText
              key={`val-${d.month}`}
              x={getX(i)}
              y={getY(d.era) - 10}
              textAnchor="middle"
              fill="#F4F4F4"
              fontSize={9}
              fontWeight="600"
            >
              {d.era.toFixed(2)}
            </SvgText>
          ))}
        </Svg>
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
  title: {
    color: "#F4F4F4",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  chartWrapper: {
    alignItems: "center",
  },
});

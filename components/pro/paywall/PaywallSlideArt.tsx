import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Line, Polyline, Text as SvgText } from "react-native-svg";

/**
 * Paywall スライド専用のイラスト。実データを持たない機能（シーズン推移・広告非表示）を
 * 「何ができるか」が一目で伝わる図にする。分析カードの実コンポーネントには依存しない
 * 自己完結の静的描画で、タップ・凡例・カード装飾は持たない。
 */

const CHART_WIDTH = 260;
const CHART_HEIGHT = 120;
const PADDING_LEFT = 26;
const PADDING_BOTTOM = 22;

// 2シーズン分の打率推移。数値はイラスト用の固定値で、正確さは求めない。
const LAST_SEASON: readonly number[] = [0.24, 0.27, 0.25, 0.29, 0.28];
const THIS_SEASON: readonly number[] = [0.28, 0.31, 0.33, 0.32, 0.36];

const MIN_AVERAGE = 0.2;
const MAX_AVERAGE = 0.4;

interface ChartPoint {
  x: number;
  y: number;
}

const toChartPoints = (values: readonly number[]): ChartPoint[] => {
  const usableWidth = CHART_WIDTH - PADDING_LEFT - 8;
  const usableHeight = CHART_HEIGHT - PADDING_BOTTOM - 10;
  return values.map((value, index) => {
    const ratio = (value - MIN_AVERAGE) / (MAX_AVERAGE - MIN_AVERAGE);
    return {
      x: PADDING_LEFT + (usableWidth / (values.length - 1)) * index,
      y: 10 + usableHeight * (1 - Math.min(1, Math.max(0, ratio))),
    };
  });
};

const toPolyline = (points: ChartPoint[]): string =>
  points
    .map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`)
    .join(" ");

const yForAverage = (average: number): number => {
  const usableHeight = CHART_HEIGHT - PADDING_BOTTOM - 10;
  const ratio = (average - MIN_AVERAGE) / (MAX_AVERAGE - MIN_AVERAGE);
  return 10 + usableHeight * (1 - ratio);
};

/** シーズンを跨いだ打率推移の比較イラスト。 */
export function SeasonTrendArt() {
  const lastPoints = toChartPoints(LAST_SEASON);
  const thisPoints = toChartPoints(THIS_SEASON);
  return (
    <View style={styles.artBox}>
      <Svg
        width="100%"
        height={CHART_HEIGHT}
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
      >
        {[0.2, 0.3, 0.4].map((tick) => {
          const y = yForAverage(tick);
          return (
            <React.Fragment key={tick}>
              <Line
                x1={PADDING_LEFT}
                y1={y}
                x2={CHART_WIDTH - 8}
                y2={y}
                stroke="#4A4A4A"
                strokeWidth={1}
              />
              <SvgText x={0} y={y + 4} fill="#71717A" fontSize={10}>
                {tick.toFixed(3).replace(/^0\./, ".")}
              </SvgText>
            </React.Fragment>
          );
        })}
        <Polyline
          points={toPolyline(lastPoints)}
          fill="none"
          stroke="#71717A"
          strokeWidth={2}
          strokeDasharray="4 3"
        />
        <Polyline
          points={toPolyline(thisPoints)}
          fill="none"
          stroke="#d08000"
          strokeWidth={3}
        />
        {thisPoints.map((point) => (
          <Circle
            key={`${point.x}-${point.y}`}
            cx={point.x}
            cy={point.y}
            r={3.5}
            fill="#d08000"
          />
        ))}
      </Svg>
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendLine, styles.legendLineLast]} />
          <Text style={styles.legendLabel}>昨シーズン</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendLine, styles.legendLineThis]} />
          <Text style={styles.legendLabel}>今シーズン</Text>
        </View>
      </View>
    </View>
  );
}

/** 広告が消えて記録に集中できることを示すイラスト。 */
export function NoAdsArt() {
  return (
    <View style={styles.artBox}>
      <View style={styles.phoneMock}>
        <View style={styles.mockLineWide} />
        <View style={styles.mockLine} />
        <View style={styles.mockAdSlot}>
          <Text style={styles.mockAdText}>広告</Text>
          <View style={styles.mockAdStrike} />
        </View>
        <View style={styles.mockLine} />
        <View style={styles.mockLineWide} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  artBox: {
    width: "100%",
    backgroundColor: "#27272A",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  legendRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendLine: {
    width: 18,
    height: 3,
    borderRadius: 2,
  },
  legendLineLast: {
    backgroundColor: "#71717A",
  },
  legendLineThis: {
    backgroundColor: "#d08000",
  },
  legendLabel: {
    color: "#A1A1AA",
    fontSize: 11,
  },
  phoneMock: {
    width: "100%",
    gap: 10,
    paddingVertical: 8,
  },
  mockLine: {
    height: 10,
    width: "62%",
    borderRadius: 5,
    backgroundColor: "#3F3F46",
  },
  mockLineWide: {
    height: 10,
    width: "88%",
    borderRadius: 5,
    backgroundColor: "#3F3F46",
  },
  mockAdSlot: {
    height: 52,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#52525B",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  mockAdText: {
    color: "#71717A",
    fontSize: 14,
    fontWeight: "700",
  },
  mockAdStrike: {
    position: "absolute",
    width: "70%",
    height: 2,
    backgroundColor: "#d08000",
    transform: [{ rotate: "-12deg" }],
  },
});

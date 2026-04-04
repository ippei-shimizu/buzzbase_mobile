import type { MonthlyGame } from "../../types/stats";
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Rect, Text as SvgText } from "react-native-svg";

interface MonthlyGameChartProps {
  games: MonthlyGame[];
}

const CHART_HEIGHT = 80;
const BAR_GAP = 4;

export const MonthlyGameChart = ({ games }: MonthlyGameChartProps) => {
  if (games.length === 0) return null;

  const maxCount = Math.max(...games.map((g) => g.count), 1);
  const barWidth = Math.min(30, (300 - BAR_GAP * games.length) / games.length);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>月別試合数</Text>
      <View style={styles.chartContainer}>
        <Svg
          width={games.length * (barWidth + BAR_GAP)}
          height={CHART_HEIGHT + 24}
        >
          {games.map((g, i) => {
            const x = i * (barWidth + BAR_GAP);
            const barH = (g.count / maxCount) * CHART_HEIGHT;
            const y = CHART_HEIGHT - barH;
            return (
              <React.Fragment key={g.month}>
                <SvgText
                  x={x + barWidth / 2}
                  y={y - 4}
                  textAnchor="middle"
                  fill="#A1A1AA"
                  fontSize={9}
                >
                  {g.count}
                </SvgText>
                <Rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barH}
                  rx={3}
                  fill="#d08000"
                  opacity={0.5 + (g.count / maxCount) * 0.5}
                />
                <SvgText
                  x={x + barWidth / 2}
                  y={CHART_HEIGHT + 14}
                  textAnchor="middle"
                  fill="#71717A"
                  fontSize={10}
                >
                  {g.month}月
                </SvgText>
              </React.Fragment>
            );
          })}
        </Svg>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#F4F4F4",
    marginBottom: 12,
  },
  chartContainer: { alignItems: "center" },
});

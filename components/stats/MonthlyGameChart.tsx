import type { MonthlyGame } from "../../types/stats";
import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Rect, G, Text as SvgText } from "react-native-svg";

interface MonthlyGameChartProps {
  games: MonthlyGame[];
}

const CHART_HEIGHT = 80;
const BAR_GAP = 4;
const TOP_PADDING = 16;

export const MonthlyGameChart = ({ games }: MonthlyGameChartProps) => {
  // タップした棒を記憶してツールチップを描画する（推移グラフと同じ挙動）。
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  if (games.length === 0) return null;

  const maxCount = Math.max(...games.map((g) => g.count), 1);
  const barWidth = Math.min(30, (300 - BAR_GAP * games.length) / games.length);
  const chartWidth = games.length * (barWidth + BAR_GAP);
  const svgHeight = CHART_HEIGHT + TOP_PADDING + 24;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>月別試合数</Text>
      <View style={styles.chartContainer}>
        <Svg width={chartWidth} height={svgHeight}>
          {/* 空白タップでツールチップを閉じる。描画順=z-index のため後続の棒の
              onPress が優先される。 */}
          <Rect
            x={0}
            y={0}
            width={chartWidth}
            height={svgHeight}
            fill="transparent"
            onPress={() => setSelectedMonth(null)}
          />
          {games.map((g, i) => {
            const x = i * (barWidth + BAR_GAP);
            const barH = (g.count / maxCount) * CHART_HEIGHT;
            const y = TOP_PADDING + CHART_HEIGHT - barH;
            const isSelected = selectedMonth === g.month;
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
                {/* 棒の全高（0 本でも押せるよう列全体）をタップ領域にする。 */}
                <Rect
                  x={x}
                  y={TOP_PADDING}
                  width={barWidth}
                  height={CHART_HEIGHT}
                  fill="transparent"
                  onPress={() =>
                    setSelectedMonth((prev) =>
                      prev === g.month ? null : g.month,
                    )
                  }
                />
                <Rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barH}
                  rx={3}
                  fill="#d08000"
                  opacity={isSelected ? 1 : 0.5 + (g.count / maxCount) * 0.5}
                  stroke={isSelected ? "#F4F4F4" : "none"}
                  strokeWidth={isSelected ? 1.5 : 0}
                />
                <SvgText
                  x={x + barWidth / 2}
                  y={TOP_PADDING + CHART_HEIGHT + 14}
                  textAnchor="middle"
                  fill="#71717A"
                  fontSize={10}
                >
                  {g.month}月
                </SvgText>
              </React.Fragment>
            );
          })}

          {selectedMonth !== null &&
            (() => {
              const index = games.findIndex((g) => g.month === selectedMonth);
              const game = games[index];
              if (!game) return null;
              const barH = (game.count / maxCount) * CHART_HEIGHT;
              const barY = TOP_PADDING + CHART_HEIGHT - barH;
              const cx = index * (barWidth + BAR_GAP) + barWidth / 2;
              const labelText = `${game.month}月 ${game.count}試合`;
              const tooltipWidth = Math.max(56, labelText.length * 7 + 16);
              const tooltipHeight = 22;
              let tx = cx - tooltipWidth / 2;
              if (tx < 2) tx = 2;
              if (tx + tooltipWidth > chartWidth - 2)
                tx = chartWidth - tooltipWidth - 2;
              // 棒の上に置き、上端で見切れる場合は棒の内側へ落とす。
              let ty = barY - tooltipHeight - 6;
              if (ty < 2) ty = barY + 6;
              return (
                <G>
                  <Rect
                    x={tx}
                    y={ty}
                    width={tooltipWidth}
                    height={tooltipHeight}
                    rx={5}
                    fill="#27272A"
                    stroke="#d08000"
                    strokeWidth={1}
                  />
                  <SvgText
                    x={tx + tooltipWidth / 2}
                    y={ty + 15}
                    textAnchor="middle"
                    fill="#F4F4F4"
                    fontSize={11}
                    fontWeight="700"
                  >
                    {labelText}
                  </SvgText>
                </G>
              );
            })()}
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

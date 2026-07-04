import type { MenuTrend, MenuTrendBucket } from "../../types/practice";
import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, {
  Path,
  Circle,
  Line,
  Text as SvgText,
  Defs,
  LinearGradient,
  Stop,
} from "react-native-svg";
import { UnderlineTabBar } from "@components/ui/UnderlineTabBar";
import { formatTotalAmount, formatVolume } from "@constants/practice";
import { useMenuTrend } from "@hooks/usePracticeSummaries";

type Period = "year" | "month" | "day";
const SEGMENTS = ["年別", "月別", "日別"];
const PERIODS: Period[] = ["year", "month", "day"];

const bucketValue = (trend: MenuTrend, bucket: MenuTrendBucket): number =>
  trend.menu.is_weight_reps ? bucket.total_volume : bucket.total_amount;

const bucketValueText = (trend: MenuTrend, bucket: MenuTrendBucket): string =>
  trend.menu.is_weight_reps
    ? formatVolume(bucket.total_volume)
    : formatTotalAmount(bucket.total_amount, trend.menu.unit_label);

// "2026" / "2026-06" / "2026-06-27" を表示ラベルへ。
const periodLabel = (period: Period, value: string): string => {
  const parts = value.split("-").map(Number);
  if (period === "year") return `${parts[0]}年`;
  if (period === "month") return `${parts[0]}/${parts[1]}`;
  return `${parts[1]}/${parts[2]}`;
};

const CHART_WIDTH = 300;
const CHART_HEIGHT = 160;
const PADDING_LEFT = 40;
const PADDING_RIGHT = 14;
const PADDING_TOP = 16;
const PADDING_BOTTOM = 26;
const PLOT_WIDTH = CHART_WIDTH - PADDING_LEFT - PADDING_RIGHT;
const PLOT_HEIGHT = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;

/** Y軸目盛りなど、値を短く表示する（1万以上は k 表記）。 */
const axisLabel = (value: number): string =>
  value >= 10_000
    ? `${Math.round(value / 1000).toLocaleString()}k`
    : Number(value).toLocaleString();

/** メニューの推移を折れ線グラフで表示する（成績画面と同じ SVG 折れ線方式）。 */
function TrendLine({
  trend,
  period,
  buckets,
}: {
  trend: MenuTrend;
  period: Period;
  buckets: MenuTrendBucket[];
}) {
  const limit = period === "day" ? 14 : period === "month" ? 12 : 6;
  const shown = buckets.slice(0, limit).reverse(); // 古い→新しい
  if (shown.length === 0) return null;

  const values = shown.map((bucket) => bucketValue(trend, bucket));
  const max = Math.max(...values, 1);

  const getX = (index: number) =>
    PADDING_LEFT +
    (shown.length === 1
      ? PLOT_WIDTH / 2
      : (index / (shown.length - 1)) * PLOT_WIDTH);
  const getY = (value: number) =>
    PADDING_TOP + PLOT_HEIGHT - (value / max) * PLOT_HEIGHT;

  const linePath = values
    .map(
      (value, index) =>
        `${index === 0 ? "M" : "L"} ${getX(index)},${getY(value)}`,
    )
    .join(" ");
  const areaPath = `${linePath} L ${getX(shown.length - 1)},${PADDING_TOP + PLOT_HEIGHT} L ${getX(0)},${PADDING_TOP + PLOT_HEIGHT} Z`;

  // X軸ラベルは詰まらないよう間引く（先頭・末尾は必ず表示）。
  const labelStep = Math.ceil(shown.length / 6);
  const yTicks = [0, max];

  return (
    <View style={styles.chartWrapper}>
      <Svg
        width={CHART_WIDTH}
        height={CHART_HEIGHT}
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
      >
        <Defs>
          <LinearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#d08000" stopOpacity={0.28} />
            <Stop offset="100%" stopColor="#d08000" stopOpacity={0.02} />
          </LinearGradient>
        </Defs>

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
              {axisLabel(tick)}
            </SvgText>
          </React.Fragment>
        ))}

        <Path d={areaPath} fill="url(#trendGrad)" />
        <Path
          d={linePath}
          fill="none"
          stroke="#d08000"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {shown.map((bucket, index) => (
          <React.Fragment key={`pt-${bucket.period}`}>
            <Circle
              cx={getX(index)}
              cy={getY(values[index])}
              r={4}
              fill="#d08000"
            />
            <Circle
              cx={getX(index)}
              cy={getY(values[index])}
              r={2}
              fill="#F4F4F4"
            />
          </React.Fragment>
        ))}

        {shown.map((bucket, index) =>
          index % labelStep === 0 || index === shown.length - 1 ? (
            <SvgText
              key={`xl-${bucket.period}`}
              x={getX(index)}
              y={CHART_HEIGHT - 6}
              textAnchor="middle"
              fill="#A1A1AA"
              fontSize={10}
            >
              {periodLabel(period, bucket.period)}
            </SvgText>
          ) : null,
        )}
      </Svg>
    </View>
  );
}

export default function MenuTrendScreen() {
  const { menuId } = useLocalSearchParams<{ menuId: string }>();
  const { trend, isLoading } = useMenuTrend(menuId ? Number(menuId) : null);
  const [segment, setSegment] = useState(1); // 既定: 月別

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#d08000" />
      </View>
    );
  }
  if (!trend) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>データが見つかりません</Text>
      </View>
    );
  }

  const period = PERIODS[segment];
  const buckets =
    (period === "year"
      ? trend.by_year
      : period === "month"
        ? trend.by_month
        : trend.by_day) ?? [];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{trend.menu.name}</Text>

        <View style={styles.tabWrap}>
          <UnderlineTabBar
            options={SEGMENTS}
            selectedIndex={segment}
            onSelect={setSegment}
          />
        </View>

        {buckets.length === 0 ? (
          <Text style={styles.muted}>記録がありません</Text>
        ) : (
          <>
            <View style={styles.card}>
              <TrendLine trend={trend} period={period} buckets={buckets} />
            </View>
            <View style={styles.listCard}>
              {buckets.map((bucket) => (
                <View key={bucket.period} style={styles.row}>
                  <Text style={styles.rowLabel}>
                    {periodLabel(period, bucket.period)}
                  </Text>
                  <View style={styles.rowRight}>
                    <Text style={styles.rowValue}>
                      {bucketValueText(trend, bucket)}
                    </Text>
                    {period !== "day" ? (
                      <Text style={styles.rowSub}>{bucket.days_count}日</Text>
                    ) : null}
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#2E2E2E" },
  content: { padding: 16, paddingBottom: 40 },
  centered: {
    flex: 1,
    backgroundColor: "#2E2E2E",
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: { color: "#A1A1AA", fontSize: 15 },
  title: { color: "#F4F4F4", fontSize: 20, fontWeight: "700" },
  tabWrap: { marginTop: 16, marginBottom: 4 },
  muted: { color: "#A1A1AA", fontSize: 13, marginTop: 24, textAlign: "center" },
  card: {
    backgroundColor: "#3A3A3A",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  chartWrapper: { alignItems: "center" },
  listCard: {
    backgroundColor: "#3A3A3A",
    borderRadius: 12,
    paddingHorizontal: 14,
    marginTop: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2E2E2E",
  },
  rowLabel: { color: "#F4F4F4", fontSize: 14, fontWeight: "600" },
  rowRight: { flexDirection: "row", alignItems: "baseline", gap: 8 },
  rowValue: { color: "#d08000", fontSize: 16, fontWeight: "800" },
  rowSub: { color: "#A1A1AA", fontSize: 12 },
});

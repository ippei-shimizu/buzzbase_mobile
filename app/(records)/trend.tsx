import type {
  MenuTrend,
  MenuTrendBucket,
  PracticeUnit,
} from "../../types/practice";
import { useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Svg, {
  Path,
  Circle,
  Line,
  Rect,
  G,
  Text as SvgText,
  Defs,
  LinearGradient,
  Stop,
} from "react-native-svg";
import { PaywallModal } from "@components/pro/PaywallModal";
import { ProUpsellCard } from "@components/pro/ProUpsellCard";
import { SampleDataLabel } from "@components/pro/SampleDataLabel";
import { Skeleton, SkeletonList } from "@components/ui/Skeleton";
import { UnderlineTabBar } from "@components/ui/UnderlineTabBar";
import { formatTotalAmount, formatVolume } from "@constants/practice";
import { useEntitlement } from "@hooks/useEntitlement";
import { useMenuTrend } from "@hooks/usePracticeSummaries";
import { useShadowSwingTrend } from "@hooks/useShadowSwing";

type Period = "year" | "month" | "day";
const SEGMENTS = ["年別", "月別", "日別"];
const PERIODS: Period[] = ["year", "month", "day"];

interface RangeOption {
  label: string;
  limit: number | null; // null = 全期間
}

// 粒度ごとの表示レンジ。件数が増えても直近に絞れるようにする（全期間は横スクロールで見る）。
const RANGE_OPTIONS: Record<Period, RangeOption[]> = {
  year: [
    { label: "3年", limit: 3 },
    { label: "5年", limit: 5 },
    { label: "全期間", limit: null },
  ],
  month: [
    { label: "6ヶ月", limit: 6 },
    { label: "1年", limit: 12 },
    { label: "2年", limit: 24 },
    { label: "全期間", limit: null },
  ],
  day: [
    { label: "2週間", limit: 14 },
    { label: "1ヶ月", limit: 30 },
    { label: "3ヶ月", limit: 90 },
    { label: "全期間", limit: null },
  ],
};
const DEFAULT_RANGE_INDEX: Record<Period, number> = {
  year: 2,
  month: 1,
  day: 1,
};

const pad2 = (value: number): string => String(value).padStart(2, "0");

const yearPeriod = (base: Date, offsetFromNow: number): string =>
  String(base.getFullYear() - offsetFromNow);

const monthPeriod = (base: Date, offsetFromNow: number): string => {
  const date = new Date(base.getFullYear(), base.getMonth() - offsetFromNow, 1);
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}`;
};

const dayPeriod = (base: Date, offsetFromNow: number): string => {
  const date = new Date(
    base.getFullYear(),
    base.getMonth(),
    base.getDate() - offsetFromNow,
  );
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
};

// offsetFromNow=0 が最新（新しい順）。値は古いほど小さくし、右肩上がりのサンプルに見せる。
const buildSampleBuckets = (
  count: number,
  periodFor: (offsetFromNow: number) => string,
  baseValue: number,
  growthStep: number,
  daysCountFor: (offsetFromNow: number) => number,
): MenuTrendBucket[] =>
  Array.from({ length: count }, (_, offsetFromNow) => {
    const value = baseValue + growthStep * (count - 1 - offsetFromNow);
    return {
      period: periodFor(offsetFromNow),
      total_amount: value,
      total_volume: value,
      days_count: daysCountFor(offsetFromNow),
    };
  });

// メニュー・単位によらず、どのメニューでも同じ右肩上がりの例を見せる（内容の作り分けはしない）。
const SAMPLE_YEAR = { base: 800, step: 700 };
const SAMPLE_MONTH = { base: 80, step: 40 };
const SAMPLE_DAY = { base: 8, step: 4 };

/**
 * 無料ユーザー向けのサンプル推移データを組み立てる。
 * 推移詳細APIはPro限定のため叩かず、どのメニューでも同じ一般的な例をその場で生成して見せる。
 * 表示単位（kg / 本など）だけは実際のメニューに合わせる。
 */
const buildSampleTrend = (
  menuName: string,
  unit: PracticeUnit,
  unitLabel: string | null,
): MenuTrend => {
  const now = new Date();
  const isWeightReps = unit === "weight_reps";

  return {
    menu: {
      id: -1,
      name: menuName,
      unit,
      unit_label: unitLabel,
      is_weight_reps: isWeightReps,
    },
    by_year: buildSampleBuckets(
      3,
      (offset) => yearPeriod(now, offset),
      SAMPLE_YEAR.base,
      SAMPLE_YEAR.step,
      (offset) => 30 + (2 - offset) * 15,
    ),
    by_month: buildSampleBuckets(
      6,
      (offset) => monthPeriod(now, offset),
      SAMPLE_MONTH.base,
      SAMPLE_MONTH.step,
      (offset) => 8 + (5 - offset),
    ),
    by_day: buildSampleBuckets(
      14,
      (offset) => dayPeriod(now, offset),
      SAMPLE_DAY.base,
      SAMPLE_DAY.step,
      () => 1,
    ),
  };
};

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

const CHART_HEIGHT = 180;
const PADDING_TOP = 16;
const PADDING_BOTTOM = 26;
const PLOT_HEIGHT = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;
const PLOT_BOTTOM = PADDING_TOP + PLOT_HEIGHT;
// Y 軸は左に固定描画し、プロットだけ横スクロールさせる。
const Y_AXIS_WIDTH = 40;
const PLOT_PAD_LEFT = 16;
const PLOT_PAD_RIGHT = 20;
// 点の最小間隔。件数が増えても詰まらないよう幅を可変にする基準値。
const POINT_SPACING = 46;
const MIN_INNER_WIDTH = 220;

/** Y軸目盛りなど、値を短く表示する（1万以上は k 表記）。 */
const axisLabel = (value: number): string =>
  value >= 10_000
    ? `${Math.round(value / 1000).toLocaleString()}k`
    : Number(value).toLocaleString();

/**
 * メニューの推移を折れ線グラフで表示する。
 * Y 軸は固定、プロットは点数に応じて幅が伸び横スクロールする（最新が右端）。
 * @param buckets 新しい順のバケット配列（内部で古い→新しいへ整えて描画する）
 */
function TrendLine({
  trend,
  period,
  buckets,
}: {
  trend: MenuTrend;
  period: Period;
  buckets: MenuTrendBucket[];
}) {
  const shown = [...buckets].reverse(); // 古い→新しい

  // タップした点を記憶してツールチップを描画する（成績画面の推移グラフと同じ挙動）。
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  if (shown.length === 0) return null;

  const values = shown.map((bucket) => bucketValue(trend, bucket));
  const max = Math.max(...values, 1);
  const yTicks = [0, max];

  const innerWidth =
    shown.length <= 1
      ? MIN_INNER_WIDTH
      : Math.max(MIN_INNER_WIDTH, (shown.length - 1) * POINT_SPACING);
  const plotWidth = PLOT_PAD_LEFT + innerWidth + PLOT_PAD_RIGHT;

  const getX = (index: number) =>
    PLOT_PAD_LEFT +
    (shown.length === 1
      ? innerWidth / 2
      : (index / (shown.length - 1)) * innerWidth);
  const getY = (value: number) =>
    PADDING_TOP + PLOT_HEIGHT - (value / max) * PLOT_HEIGHT;

  // タップ領域の縦帯。隣接点との X 中点で分割し、両端はプロット境界にクランプする。
  const getBandX = (index: number) =>
    index === 0 ? 0 : (getX(index - 1) + getX(index)) / 2;
  const getBandRight = (index: number) =>
    index === shown.length - 1
      ? plotWidth
      : (getX(index) + getX(index + 1)) / 2;

  const linePath = values
    .map(
      (value, index) =>
        `${index === 0 ? "M" : "L"} ${getX(index)},${getY(value)}`,
    )
    .join(" ");
  const areaPath = `${linePath} L ${getX(shown.length - 1)},${PLOT_BOTTOM} L ${getX(0)},${PLOT_BOTTOM} Z`;

  return (
    <View style={styles.chartRow}>
      <Svg width={Y_AXIS_WIDTH} height={CHART_HEIGHT}>
        {yTicks.map((tick) => (
          <SvgText
            key={`y-${tick}`}
            x={Y_AXIS_WIDTH - 6}
            y={getY(tick) + 3}
            textAnchor="end"
            fill="#71717A"
            fontSize={10}
          >
            {axisLabel(tick)}
          </SvgText>
        ))}
      </Svg>

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        onContentSizeChange={() =>
          scrollRef.current?.scrollToEnd({ animated: false })
        }
      >
        <Svg width={plotWidth} height={CHART_HEIGHT}>
          <Defs>
            <LinearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#d08000" stopOpacity={0.28} />
              <Stop offset="100%" stopColor="#d08000" stopOpacity={0.02} />
            </LinearGradient>
          </Defs>

          {/* 空白タップでツールチップを閉じる。描画順=z-index のため後続の点の帯が優先される。 */}
          <Rect
            x={0}
            y={0}
            width={plotWidth}
            height={CHART_HEIGHT}
            fill="transparent"
            onPress={() => setSelectedIndex(null)}
          />

          {yTicks.map((tick) => (
            <Line
              key={`grid-${tick}`}
              x1={0}
              y1={getY(tick)}
              x2={plotWidth}
              y2={getY(tick)}
              stroke="#424242"
              strokeWidth={0.5}
            />
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

          {shown.map((bucket, index) => {
            const isSelected = selectedIndex === index;
            const bandX = getBandX(index);
            const bandWidth = getBandRight(index) - bandX;
            const bandY = Math.max(PADDING_TOP, getY(values[index]) - 8);
            return (
              <React.Fragment key={`pt-${bucket.period}`}>
                <Rect
                  x={bandX}
                  y={bandY}
                  width={bandWidth}
                  height={PLOT_BOTTOM - bandY}
                  fill="transparent"
                  onPress={() =>
                    setSelectedIndex((prev) => (prev === index ? null : index))
                  }
                />
                <Circle
                  cx={getX(index)}
                  cy={getY(values[index])}
                  r={isSelected ? 5 : 4}
                  fill="#d08000"
                  stroke={isSelected ? "#F4F4F4" : "none"}
                  strokeWidth={isSelected ? 1.5 : 0}
                />
                <Circle
                  cx={getX(index)}
                  cy={getY(values[index])}
                  r={2}
                  fill="#F4F4F4"
                />
              </React.Fragment>
            );
          })}

          {selectedIndex !== null &&
            (() => {
              const bucket = shown[selectedIndex];
              if (!bucket) return null;
              const valueText = bucketValueText(trend, bucket);
              const labelText = periodLabel(period, bucket.period);
              const cx = getX(selectedIndex);
              const cy = getY(values[selectedIndex]);
              const tooltipWidth = Math.max(
                64,
                valueText.length * 8 + 20,
                labelText.length * 7 + 20,
              );
              const tooltipHeight = 34;
              // 画面端で見切れないよう x / y を調整する。
              let tx = cx - tooltipWidth / 2;
              if (tx < 2) tx = 2;
              if (tx + tooltipWidth > plotWidth - 2)
                tx = plotWidth - tooltipWidth - 2;
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
                    stroke="#d08000"
                    strokeWidth={1}
                  />
                  <SvgText
                    x={tx + tooltipWidth / 2}
                    y={ty + 14}
                    textAnchor="middle"
                    fill="#F4F4F4"
                    fontSize={12}
                    fontWeight="700"
                  >
                    {valueText}
                  </SvgText>
                  <SvgText
                    x={tx + tooltipWidth / 2}
                    y={ty + 27}
                    textAnchor="middle"
                    fill="#A1A1AA"
                    fontSize={9}
                  >
                    {labelText}
                  </SvgText>
                </G>
              );
            })()}

          {shown.map((bucket, index) => (
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
          ))}
        </Svg>
      </ScrollView>
    </View>
  );
}

function RangeChips({
  options,
  selectedIndex,
  onSelect,
}: {
  options: RangeOption[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}) {
  return (
    <View style={styles.rangeRow}>
      {options.map((option, index) => {
        const active = index === selectedIndex;
        return (
          <Pressable
            key={option.label}
            onPress={() => onSelect(index)}
            style={[styles.rangeChip, active && styles.rangeChipActive]}
          >
            <Text
              style={[
                styles.rangeChipText,
                active && styles.rangeChipTextActive,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function MenuTrendScreen() {
  const { menuId, menuName, unit, unitLabel, source } = useLocalSearchParams<{
    menuId?: string;
    menuName?: string;
    unit?: string;
    unitLabel?: string;
    source?: string;
  }>();
  const isShadowSwing = source === "shadow_swing";
  const { hasEntitlement, isLoading: isProLoading } = useEntitlement();
  const isPro = hasEntitlement("practice_menu_trend_detail");
  // 無料ユーザーは推移詳細APIを叩かない（Pro限定のためサーバー側も403を返す設計）。
  const { trend: fetchedMenuTrend, isLoading: isMenuTrendLoading } =
    useMenuTrend(!isShadowSwing && menuId ? Number(menuId) : null, {
      enabled: isPro && !isShadowSwing,
    });
  const { trend: fetchedShadowSwingTrend, isLoading: isShadowSwingLoading } =
    useShadowSwingTrend({ enabled: isPro && isShadowSwing });
  const fetchedTrend = isShadowSwing
    ? fetchedShadowSwingTrend
    : fetchedMenuTrend;
  const isTrendLoading = isShadowSwing
    ? isShadowSwingLoading
    : isMenuTrendLoading;
  const [segment, setSegment] = useState(1); // 既定: 月別
  const [rangeIndex, setRangeIndex] = useState(DEFAULT_RANGE_INDEX.month);
  const [isTrendPaywallOpen, setTrendPaywallOpen] = useState(false);

  // 粒度を切り替えたらレンジも既定へ戻す（粒度ごとに選択肢が異なるため）。
  const handleSegmentChange = (index: number) => {
    setSegment(index);
    setRangeIndex(DEFAULT_RANGE_INDEX[PERIODS[index]]);
  };

  if (isProLoading || (isPro && isTrendLoading)) {
    return (
      <View style={styles.skeleton}>
        <Skeleton height={220} borderRadius={10} />
        <SkeletonList count={4} itemHeight={64} />
      </View>
    );
  }

  // 無料ユーザーはサーバーから実データを取得せず、その場で組み立てたサンプルを表示する。
  const trend = isPro
    ? fetchedTrend
    : buildSampleTrend(
        menuName || "メニュー",
        (unit as PracticeUnit) || "count",
        unitLabel || null,
      );

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

  const rangeOptions = RANGE_OPTIONS[period];
  const rangeOption =
    rangeOptions[rangeIndex] ?? rangeOptions[rangeOptions.length - 1];
  // buckets は新しい順。レンジ指定があれば直近 limit 件に絞る。
  const rangedBuckets =
    rangeOption.limit == null ? buckets : buckets.slice(0, rangeOption.limit);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{trend.menu.name}</Text>

        {!isPro ? (
          <ProUpsellCard
            feature="practice_menu_trend_detail"
            onPressCta={() => setTrendPaywallOpen(true)}
            style={styles.upsellCard}
          />
        ) : null}

        <View style={styles.tabWrap}>
          <UnderlineTabBar
            options={SEGMENTS}
            selectedIndex={segment}
            onSelect={handleSegmentChange}
          />
        </View>

        {buckets.length === 0 ? (
          <Text style={styles.muted}>記録がありません</Text>
        ) : (
          <>
            <RangeChips
              options={rangeOptions}
              selectedIndex={rangeIndex}
              onSelect={setRangeIndex}
            />

            {!isPro ? <SampleDataLabel /> : null}

            <View style={!isPro ? styles.sampleDataWrap : undefined}>
              <View style={styles.card}>
                <TrendLine
                  key={`${period}-${rangeIndex}`}
                  trend={trend}
                  period={period}
                  buckets={rangedBuckets}
                />
              </View>
              <View style={styles.listCard}>
                {rangedBuckets.map((bucket) => (
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
            </View>
          </>
        )}
      </ScrollView>
      <PaywallModal
        isOpen={isTrendPaywallOpen}
        onClose={() => setTrendPaywallOpen(false)}
        feature="practice_menu_trend_detail"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: { flex: 1, backgroundColor: "#2E2E2E", padding: 16, gap: 16 },
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
  upsellCard: { marginTop: 16 },
  tabWrap: { marginTop: 16, marginBottom: 4 },
  muted: { color: "#A1A1AA", fontSize: 13, marginTop: 24, textAlign: "center" },
  sampleDataWrap: {
    marginTop: 4,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#52525B",
  },
  rangeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  rangeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#52525B",
    backgroundColor: "#3A3A3A",
  },
  rangeChipActive: {
    backgroundColor: "#d08000",
    borderColor: "#d08000",
  },
  rangeChipText: { color: "#A1A1AA", fontSize: 12, fontWeight: "600" },
  rangeChipTextActive: { color: "#2E2E2E" },
  card: {
    backgroundColor: "#3A3A3A",
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  chartRow: { flexDirection: "row", alignItems: "flex-start" },
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

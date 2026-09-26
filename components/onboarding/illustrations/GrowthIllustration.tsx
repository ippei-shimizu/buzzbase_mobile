import React from "react";
import {
  Circle,
  G,
  Line,
  Path,
  Polygon,
  Polyline,
  Rect,
  Text as SvgText,
} from "react-native-svg";
import {
  type ArtProps,
  ArtCanvas,
  BRAND,
  Card,
  Confetti,
  INK,
  MUTED,
  Sparkle,
  SUB_INK,
} from "@components/pro/paywall/artPrimitives";

const CHART = { left: 44, right: 222, top: 70, bottom: 150 } as const;
const MIN_AVERAGE = 0.22;
const MAX_AVERAGE = 0.34;

// シーズン粒度の推移は Pro 限定のため、無料で見られる月別の1系列だけを描く。
const MONTHLY_AVERAGES = [
  { month: "4月", average: 0.245 },
  { month: "5月", average: 0.262 },
  { month: "6月", average: 0.258 },
  { month: "7月", average: 0.291 },
  { month: "8月", average: 0.318 },
] as const;

const xFor = (index: number) =>
  CHART.left +
  12 +
  ((CHART.right - CHART.left - 24) / (MONTHLY_AVERAGES.length - 1)) * index;

const yFor = (average: number) =>
  CHART.bottom -
  ((average - MIN_AVERAGE) / (MAX_AVERAGE - MIN_AVERAGE)) *
    (CHART.bottom - CHART.top);

/**
 * 「成長を1枚のグラフで」の図。
 * 構図: 端末を使わずグラフのカードを斜めに重ね、最新月の打率を吹き出しでカード外へ出す。
 */
export function GrowthIllustration({ height }: ArtProps) {
  const points = MONTHLY_AVERAGES.map(
    ({ average }, index) => `${xFor(index)},${yFor(average).toFixed(1)}`,
  );
  const latestMonth = MONTHLY_AVERAGES[MONTHLY_AVERAGES.length - 1];
  const latestX = xFor(MONTHLY_AVERAGES.length - 1);
  const latestY = yFor(latestMonth.average);
  const areaPath = `M ${xFor(0)} ${CHART.bottom} L ${points.join(" L ")} L ${latestX} ${CHART.bottom} Z`;

  return (
    <ArtCanvas height={height}>
      <Confetti
        items={[
          { cx: 14, cy: 26, r: 8, fill: "#5B8DEF", opacity: 0.22 },
          { cx: 264, cy: 172, r: 9, fill: "#4F9E6B", opacity: 0.22 },
        ]}
      />

      <G transform="rotate(-5 145 95)">
        <Card x={40} y={20} width={210} height={146} opacity={0.55} />
      </G>
      <Card x={24} y={30} width={214} height={148} />

      <SvgText x={38} y={50} fill={SUB_INK} fontSize={10}>
        打率の推移
      </SvgText>
      <Rect
        x={96}
        y={40}
        width={34}
        height={15}
        rx={7.5}
        fill="rgba(208, 128, 0, 0.18)"
      />
      <SvgText
        x={113}
        y={51}
        fill={BRAND}
        fontSize={9}
        fontWeight="bold"
        textAnchor="middle"
      >
        月別
      </SvgText>

      {[0.32, 0.28, 0.24].map((tick) => (
        <Line
          key={tick}
          x1={CHART.left}
          y1={yFor(tick)}
          x2={CHART.right}
          y2={yFor(tick)}
          stroke={MUTED}
          strokeWidth={1}
          opacity={0.55}
        />
      ))}

      <Path d={areaPath} fill={BRAND} fillOpacity={0.15} />
      <Polyline
        points={points.join(" ")}
        fill="none"
        stroke={BRAND}
        strokeWidth={3.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {MONTHLY_AVERAGES.map(({ month, average }, index) => (
        <G key={month}>
          <Circle cx={xFor(index)} cy={yFor(average)} r={3.5} fill={BRAND} />
          <SvgText
            x={xFor(index)}
            y={166}
            fill={SUB_INK}
            fontSize={8}
            textAnchor="middle"
          >
            {month}
          </SvgText>
        </G>
      ))}
      <Circle
        cx={latestX}
        cy={latestY}
        r={7}
        fill="none"
        stroke={BRAND}
        strokeWidth={2}
        opacity={0.6}
      />

      <G>
        <Rect x={180} y={10} width={76} height={36} rx={12} fill={BRAND} />
        <Polygon
          points={`${latestX - 6},46 ${latestX + 6},46 ${latestX},53`}
          fill={BRAND}
        />
        <Line
          x1={latestX}
          y1={53}
          x2={latestX}
          y2={latestY - 9}
          stroke={BRAND}
          strokeWidth={1.5}
          opacity={0.6}
        />
        <SvgText x={190} y={25} fill="#2E2E2E" fontSize={9} fontWeight="bold">
          {`${latestMonth.month}の打率`}
        </SvgText>
        <SvgText x={190} y={40} fill="#2E2E2E" fontSize={14} fontWeight="bold">
          {latestMonth.average.toFixed(3).replace(/^0/, "")}
        </SvgText>
        <Polygon points="236,40 242,29 248,40" fill="#2E2E2E" />
      </G>
      <Sparkle x={266} y={58} size={6} />
      <Sparkle x={170} y={16} size={4} color={INK} />
    </ArtCanvas>
  );
}

import React from "react";
import { G, Path, Rect, Text as SvgText } from "react-native-svg";
import {
  type ArtProps,
  ArtCanvas,
  BRAND,
  Card,
  CARD_BG,
  Confetti,
  INK,
  MUTED,
  PhoneMock,
  Sparkle,
  SUB_INK,
} from "@components/pro/paywall/artPrimitives";

const PHONE = { x: 22, y: 14, width: 132, height: 246 } as const;

const PLATE_APPEARANCES = [
  { label: "1打席", result: "右安", isHit: true },
  { label: "2打席", result: "四球", isHit: false },
  { label: "3打席", result: "左二", isHit: true },
  { label: "4打席", result: "三振", isHit: false },
] as const;

const METRICS = [
  {
    label: "今季 打率",
    value: ".333",
    y: 22,
    rotate: -4,
    isHighlighted: false,
  },
  { label: "今季 OPS", value: ".900", y: 72, rotate: 0, isHighlighted: true },
  {
    label: "今季 防御率",
    value: "2.50",
    y: 122,
    rotate: 3,
    isHighlighted: false,
  },
] as const;

const METRIC_CARD = { x: 176, width: 94, height: 44 } as const;

/**
 * 「打者も投手も、入力するだけで自動計算」の図。
 * 構図: 左の端末で打席結果を入力し、右に算出された指標のカードが並ぶ。
 */
export function AutoCalcIllustration({ height }: ArtProps) {
  return (
    <ArtCanvas height={height}>
      <Confetti
        items={[
          { cx: 12, cy: 30, r: 7, fill: "#5B8DEF", opacity: 0.22 },
          { cx: 168, cy: 178, r: 9, fill: "#4F9E6B", opacity: 0.22 },
        ]}
      />
      <PhoneMock {...PHONE} showHomeIndicator={false}>
        <Rect x={36} y={42} width={40} height={6} rx={3} fill={MUTED} />
        {PLATE_APPEARANCES.map((plateAppearance, index) => {
          const rowY = 56 + index * 26;
          return (
            <G key={plateAppearance.label}>
              <Rect
                x={34}
                y={rowY}
                width={108}
                height={20}
                rx={6}
                fill={CARD_BG}
              />
              <SvgText x={42} y={rowY + 13.5} fill={SUB_INK} fontSize={9}>
                {plateAppearance.label}
              </SvgText>
              <Rect
                x={102}
                y={rowY + 3}
                width={34}
                height={14}
                rx={7}
                fill={plateAppearance.isHit ? BRAND : MUTED}
              />
              <SvgText
                x={119}
                y={rowY + 13.5}
                fill={plateAppearance.isHit ? "#2E2E2E" : INK}
                fontSize={9}
                fontWeight="bold"
                textAnchor="middle"
              >
                {plateAppearance.result}
              </SvgText>
            </G>
          );
        })}
        <Rect x={34} y={162} width={108} height={20} rx={6} fill={CARD_BG} />
        <SvgText x={42} y={175.5} fill={SUB_INK} fontSize={9}>
          投球
        </SvgText>
        <SvgText
          x={136}
          y={175.5}
          fill={INK}
          fontSize={9}
          fontWeight="bold"
          textAnchor="end"
        >
          6回 2失点
        </SvgText>
      </PhoneMock>

      <Path
        d="M158 88 L166 96 L158 104"
        fill="none"
        stroke={BRAND}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {METRICS.map((metric) => {
        const centerX = METRIC_CARD.x + METRIC_CARD.width / 2;
        const centerY = metric.y + METRIC_CARD.height / 2;
        return (
          <G
            key={metric.label}
            transform={`rotate(${metric.rotate} ${centerX} ${centerY})`}
          >
            {metric.isHighlighted ? (
              <Rect
                x={METRIC_CARD.x}
                y={metric.y}
                width={METRIC_CARD.width}
                height={METRIC_CARD.height}
                rx={12}
                fill="rgba(208, 128, 0, 0.18)"
                stroke={BRAND}
                strokeWidth={1.5}
              />
            ) : (
              <Card
                x={METRIC_CARD.x}
                y={metric.y}
                width={METRIC_CARD.width}
                height={METRIC_CARD.height}
              />
            )}
            <SvgText
              x={METRIC_CARD.x + 10}
              y={metric.y + 16}
              fill={SUB_INK}
              fontSize={10}
            >
              {metric.label}
            </SvgText>
            <SvgText
              x={METRIC_CARD.x + 10}
              y={metric.y + 36}
              fill={metric.isHighlighted ? BRAND : INK}
              fontSize={19}
              fontWeight="bold"
            >
              {metric.value}
            </SvgText>
          </G>
        );
      })}

      <Sparkle x={264} y={16} size={7} />
      <Sparkle x={272} y={98} size={4} />
    </ArtCanvas>
  );
}

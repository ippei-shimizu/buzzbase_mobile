import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, {
  Circle,
  ClipPath,
  Defs,
  G,
  Polygon,
  Rect,
} from "react-native-svg";

/**
 * Paywall のイラストで共有する部品。
 * 配色・キャンバス寸法・端末モック・カード・装飾をここに集約し、
 * スライド用（PaywallSlideArt）と機能一覧用（PaywallFeatureArt）の双方から使う。
 */

const CANVAS_WIDTH = 280;
const CANVAS_HEIGHT = 190;
// 描画は 280x190 のまま、表示領域だけ縦に広げて図をスライドの幅いっぱいまで拡大する
// （preserveAspectRatio の既定が meet のため、高さを増やすと倍率が上がる）。
export const SLIDE_ART_HEIGHT = 226;

// 端末を映す3枚（方向別 / コース別 / カウント別）で同じ大きさ・位置を使う。
// 下端はキャンバスの外に出し、画面の続きがあるように見せる。
export const PHONE = { x: 56, y: 10, width: 168, height: 250 } as const;

export const BRAND = "#d08000";
export const CARD_BG = "#27272A";
export const CARD_EDGE = "#3F3F46";
export const BODY = "#3F3F46";
export const MUTED = "#52525B";
export const INK = "#F4F4F4";
export const SUB_INK = "#A1A1AA";

export interface ConfettiItem {
  cx: number;
  cy: number;
  r: number;
  fill: string;
  opacity: number;
}

/** 背景の飾り。スライドごとに配置と色を変えて、並べたときの印象を散らす。 */
export function Confetti({ items }: { items: readonly ConfettiItem[] }) {
  return (
    <G>
      {items.map((item) => (
        <Circle
          key={`${item.cx}-${item.cy}`}
          cx={item.cx}
          cy={item.cy}
          r={item.r}
          fill={item.fill}
          opacity={item.opacity}
        />
      ))}
    </G>
  );
}

/** 四方に光る装飾。加入後の体験が特別に見えるようにする。 */
export function Sparkle({
  x,
  y,
  size,
  color = BRAND,
}: {
  x: number;
  y: number;
  size: number;
  color?: string;
}) {
  const points = [
    `${x},${y - size}`,
    `${x + size * 0.26},${y - size * 0.26}`,
    `${x + size},${y}`,
    `${x + size * 0.26},${y + size * 0.26}`,
    `${x},${y + size}`,
    `${x - size * 0.26},${y + size * 0.26}`,
    `${x - size},${y}`,
    `${x - size * 0.26},${y - size * 0.26}`,
  ].join(" ");
  return <Polygon points={points} fill={color} opacity={0.9} />;
}

export interface CardProps {
  x: number;
  y: number;
  width: number;
  height: number;
  fill?: string;
  opacity?: number;
}

/** 角丸のカード。傾けて重ねる用途が多いので G の transform と組み合わせて使う。 */
export function Card({
  x,
  y,
  width,
  height,
  fill = CARD_BG,
  opacity = 1,
}: CardProps) {
  return (
    <G opacity={opacity}>
      <Rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={12}
        fill={fill}
        stroke={CARD_EDGE}
        strokeWidth={1.5}
      />
    </G>
  );
}

export interface PhoneMockProps {
  x: number;
  y: number;
  width: number;
  height: number;
  /** 画面下端がキャンバス外に出る配置では、ホームインジケータを描かない。 */
  showHomeIndicator?: boolean;
  /** 画面内に描く中身。画面領域の座標系でそのまま置ける。 */
  children?: React.ReactNode;
}

/**
 * スマートフォンのモック。ベゼル・ダイナミックアイランド・サイドボタン・
 * ホームインジケータまで描いて、ひと目で端末だと分かる形にする。
 *
 * @returns 画面領域は x+bezel, y+bezel から (width-2*bezel, height-2*bezel)
 */
export function PhoneMock({
  x,
  y,
  width,
  height,
  showHomeIndicator = true,
  children,
}: PhoneMockProps) {
  const bodyRadius = width * 0.19;
  const bezel = width * 0.045;
  const screenX = x + bezel;
  const screenY = y + bezel;
  const screenWidth = width - bezel * 2;
  const screenHeight = height - bezel * 2;
  const islandWidth = width * 0.3;
  const islandHeight = width * 0.075;
  const islandTop = screenY + bezel * 0.9;
  const buttonWidth = Math.max(1.6, width * 0.02);
  // 画面外へ出た中身がベゼルに乗らないよう、画面の角丸でクリップする。
  const clipId = `phoneScreen-${Math.round(x)}-${Math.round(y)}-${Math.round(width)}`;
  return (
    <G>
      {/* サイドボタン（本体より先に描いて端から生えているように見せる） */}
      <Rect
        x={x - buttonWidth}
        y={y + height * 0.2}
        width={buttonWidth * 2}
        height={height * 0.05}
        rx={buttonWidth}
        fill={MUTED}
      />
      <Rect
        x={x - buttonWidth}
        y={y + height * 0.29}
        width={buttonWidth * 2}
        height={height * 0.08}
        rx={buttonWidth}
        fill={MUTED}
      />
      <Rect
        x={x + width - buttonWidth}
        y={y + height * 0.26}
        width={buttonWidth * 2}
        height={height * 0.1}
        rx={buttonWidth}
        fill={MUTED}
      />
      {/* 本体 */}
      <Rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={bodyRadius}
        fill={BODY}
        stroke={MUTED}
        strokeWidth={1.2}
      />
      {/* 画面 */}
      <Defs>
        <ClipPath id={clipId}>
          <Rect
            x={screenX}
            y={screenY}
            width={screenWidth}
            height={screenHeight}
            rx={bodyRadius - bezel}
          />
        </ClipPath>
      </Defs>
      <Rect
        x={screenX}
        y={screenY}
        width={screenWidth}
        height={screenHeight}
        rx={bodyRadius - bezel}
        fill="#1B1B1E"
      />
      <G clipPath={`url(#${clipId})`}>{children}</G>
      {/* ダイナミックアイランド */}
      <Rect
        x={x + (width - islandWidth) / 2}
        y={islandTop}
        width={islandWidth}
        height={islandHeight}
        rx={islandHeight / 2}
        fill="#101012"
      />
      {/* ホームインジケータ */}
      {showHomeIndicator ? (
        <Rect
          x={x + width * 0.32}
          y={y + height - bezel * 2.4}
          width={width * 0.36}
          height={width * 0.028}
          rx={width * 0.014}
          fill={SUB_INK}
          opacity={0.7}
        />
      ) : null}
    </G>
  );
}

export interface ArtProps {
  /** 図の高さ。機能一覧など小さく見せる場所で渡す。既定はスライド用の高さ。 */
  height?: number;
}

export function ArtCanvas({
  children,
  height = SLIDE_ART_HEIGHT,
}: ArtProps & { children: React.ReactNode }) {
  return (
    <View style={[styles.canvas, { height }]}>
      <Svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
      >
        {children}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});

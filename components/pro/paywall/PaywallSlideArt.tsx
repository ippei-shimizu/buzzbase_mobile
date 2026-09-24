import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, {
  Circle,
  ClipPath,
  Defs,
  G,
  Line,
  Path,
  Polygon,
  Polyline,
  Rect,
  Text as SvgText,
} from "react-native-svg";
import {
  GROUND_FIRST,
  GROUND_HOME,
  GROUND_LEFT_END,
  GROUND_OUTFIELD_RX,
  GROUND_OUTFIELD_RY,
  GROUND_RIGHT_END,
  GROUND_SECOND,
  GROUND_THIRD,
} from "@constants/groundCanvas";
import { PITCH_COURSE_TRACK_FRACTIONS } from "@constants/pitchCourse";

/**
 * Paywall スライドの機能紹介イラスト。
 *
 * 実際の分析コンポーネントやユーザーのデータは一切使わず、機能の雰囲気だけを
 * 伝える簡略図を描く。Paywall で本物の分析を描画すると未加入のまま中身が
 * 見えてしまうため、ここは常に作り物に留める。
 *
 * 5 枚が同じ絵に見えないよう、構図をスライドごとに変える。
 * カード / 端末 / 吹き出しといった部品は共有し、配置と主役だけを入れ替える。
 */

const CANVAS_WIDTH = 280;
const CANVAS_HEIGHT = 190;
// 描画は 280x190 のまま、表示領域だけ縦に広げて図をスライドの幅いっぱいまで拡大する
// （preserveAspectRatio の既定が meet のため、高さを増やすと倍率が上がる）。
export const SLIDE_ART_HEIGHT = 226;

// 端末を映す3枚（方向別 / コース別 / カウント別）で同じ大きさ・位置を使う。
// 下端はキャンバスの外に出し、画面の続きがあるように見せる。
const PHONE = { x: 56, y: 10, width: 168, height: 250 } as const;

const BRAND = "#d08000";
const CARD_BG = "#27272A";
const CARD_EDGE = "#3F3F46";
const BODY = "#3F3F46";
const MUTED = "#52525B";
const INK = "#F4F4F4";
const SUB_INK = "#A1A1AA";

// 球場の配色は打席記録・成績画面のグラウンド図と揃える。
const GRASS = "#4a8e32";
const GRASS_STRIPE = "#56a03c";
const GRASS_EDGE = "#3a7a28";
const DIRT = "#b07840";
const CHALK = "rgba(255,255,255,0.7)";

interface ConfettiItem {
  cx: number;
  cy: number;
  r: number;
  fill: string;
  opacity: number;
}

/** 背景の飾り。スライドごとに配置と色を変えて、並べたときの印象を散らす。 */
function Confetti({ items }: { items: readonly ConfettiItem[] }) {
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
function Sparkle({
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

interface CardProps {
  x: number;
  y: number;
  width: number;
  height: number;
  fill?: string;
  opacity?: number;
}

/** 角丸のカード。傾けて重ねる用途が多いので G の transform と組み合わせて使う。 */
function Card({ x, y, width, height, fill = CARD_BG, opacity = 1 }: CardProps) {
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

interface PhoneMockProps {
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
function PhoneMock({
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

function ArtCanvas({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.canvas}>
      <Svg
        width="100%"
        height={CANVAS_HEIGHT}
        viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
      >
        {children}
      </Svg>
    </View>
  );
}

// 球場図は打席記録 UI と同じ幾何（constants/groundCanvas）で描き、
// ダイヤモンドの比率や外野の膨らみが実際のイラストとずれないようにする。
const HOME = GROUND_HOME;
const FIRST = GROUND_FIRST;
const SECOND = GROUND_SECOND;
const THIRD = GROUND_THIRD;
const LEFT_END = GROUND_LEFT_END;
const RIGHT_END = GROUND_RIGHT_END;
const FIELD_PATH = `M ${HOME.x},${HOME.y} L ${LEFT_END.x},${LEFT_END.y} A ${GROUND_OUTFIELD_RX},${GROUND_OUTFIELD_RY} 0 0,1 ${RIGHT_END.x},${RIGHT_END.y} Z`;
const DIRT_CENTER_Y = FIRST.y + 5;
const DIRT_RADIUS = 68;
const STRIPE_X_POSITIONS: readonly number[] = Array.from(
  { length: 14 },
  (_, i) => -60 + i * 36,
);

/** 球場図。GROUND_* の座標系で描くので、呼び出し側で transform を掛けて配置する。 */
function BallparkField() {
  return (
    <G>
      <Defs>
        <ClipPath id="paywallFieldClip">
          <Path d={FIELD_PATH} />
        </ClipPath>
      </Defs>
      {/* 外野の芝とストライプ */}
      <G clipPath="url(#paywallFieldClip)">
        <Rect x={0} y={0} width={420} height={340} fill={GRASS} />
        {STRIPE_X_POSITIONS.map((stripeX) => (
          <Rect
            key={stripeX}
            x={stripeX}
            y={-80}
            width={18}
            height={620}
            fill={GRASS_STRIPE}
            opacity={0.45}
            transform="rotate(-45, 210, 160)"
          />
        ))}
      </G>
      <Path d={FIELD_PATH} fill="none" stroke={GRASS_EDGE} strokeWidth={3} />
      {/* 内野ダート */}
      <Path
        d={`M ${HOME.x - DIRT_RADIUS},${DIRT_CENTER_Y} A ${DIRT_RADIUS},${DIRT_RADIUS} 0 0,1 ${HOME.x + DIRT_RADIUS},${DIRT_CENTER_Y} L ${HOME.x + 20},${HOME.y + 5} L ${HOME.x - 20},${HOME.y + 5} Z`}
        fill={DIRT}
      />
      {/* 内野の芝 */}
      <Path
        d={`M ${HOME.x},${HOME.y - 15} L ${FIRST.x - 5},${FIRST.y + 2} L ${SECOND.x},${SECOND.y + 8} L ${THIRD.x + 5},${THIRD.y + 2} Z`}
        fill={GRASS}
      />
      {/* ファウルライン */}
      <Line
        x1={HOME.x}
        y1={HOME.y}
        x2={LEFT_END.x}
        y2={LEFT_END.y}
        stroke={CHALK}
        strokeWidth={2.5}
      />
      <Line
        x1={HOME.x}
        y1={HOME.y}
        x2={RIGHT_END.x}
        y2={RIGHT_END.y}
        stroke={CHALK}
        strokeWidth={2.5}
      />
      {/* ベースライン */}
      <Polyline
        points={`${HOME.x},${HOME.y - 3} ${FIRST.x},${FIRST.y} ${SECOND.x},${SECOND.y} ${THIRD.x},${THIRD.y} ${HOME.x},${HOME.y - 3}`}
        fill="none"
        stroke={CHALK}
        strokeWidth={2.5}
      />
      {/* 各塁とマウンド */}
      {[FIRST, SECOND, THIRD].map((base) => (
        <Rect
          key={`${base.x}-${base.y}`}
          x={base.x - 6}
          y={base.y - 6}
          width={12}
          height={12}
          rx={2}
          fill="#F4F4F4"
          transform={`rotate(45 ${base.x} ${base.y})`}
        />
      ))}
      <Circle cx={HOME.x} cy={HOME.y - 72} r={13} fill={DIRT} />
      <Polygon
        points={`${HOME.x},${HOME.y - 10} ${HOME.x + 8},${HOME.y - 3} ${HOME.x + 8},${HOME.y + 5} ${HOME.x - 8},${HOME.y + 5} ${HOME.x - 8},${HOME.y - 3}`}
        fill="#F4F4F4"
      />
    </G>
  );
}

/**
 * 方向別の打率。
 * 構図: 下端で見切れる端末の画面に球場図を映し、左右に円形の吹き出しを重ねる
 * （みてねの「公開範囲」型）。
 */
export function HitDirectionArt() {
  const bezel = PHONE.width * 0.045;
  const screenX = PHONE.x + bezel;
  // 球場図（GROUND_* 座標）を画面の幅いっぱいに収める倍率と位置。
  const scale = 0.4;
  const fieldTop = 58;
  const translateX = PHONE.x + PHONE.width / 2 - HOME.x * scale;
  const translateY = fieldTop - (HOME.y - GROUND_OUTFIELD_RY) * scale;
  // 打球方向のヒート。DIRECTION_LABEL_POSITIONS と同じ並び（左 / 中 / 右 / 二 / 遊）。
  // 打率はイラスト用のダミー値で、濃さと高低を対応させる。
  const zones = [
    { cx: 100, cy: 122, r: 37, opacity: 0.95, average: ".412", fontSize: 26 },
    { cx: 210, cy: 80, r: 31, opacity: 0.5, average: ".286", fontSize: 23 },
    { cx: 316, cy: 120, r: 34, opacity: 0.72, average: ".333", fontSize: 24 },
    { cx: 252, cy: 186, r: 29, opacity: 0.4, average: ".250", fontSize: 22 },
    { cx: 168, cy: 186, r: 29, opacity: 0.58, average: ".300", fontSize: 22 },
  ];
  return (
    <ArtCanvas>
      <Confetti
        items={[
          { cx: 262, cy: 32, r: 8, fill: "#5B8DEF", opacity: 0.25 },
          { cx: 18, cy: 160, r: 10, fill: "#4F9E6B", opacity: 0.25 },
        ]}
      />
      <PhoneMock {...PHONE} showHomeIndicator={false}>
        {/* 画面内のヘッダー */}
        <Rect
          x={screenX + 12}
          y={44}
          width={46}
          height={6}
          rx={3}
          fill={MUTED}
        />
        <G transform={`translate(${translateX} ${translateY}) scale(${scale})`}>
          <BallparkField />
          {zones.map((zone) => (
            <G key={`${zone.cx}-${zone.cy}`}>
              <Circle
                cx={zone.cx}
                cy={zone.cy}
                r={zone.r}
                fill={BRAND}
                opacity={zone.opacity}
              />
              <SvgText
                x={zone.cx}
                y={zone.cy + zone.fontSize * 0.36}
                fill={INK}
                fontSize={zone.fontSize}
                fontWeight="bold"
                textAnchor="middle"
              >
                {zone.average}
              </SvgText>
            </G>
          ))}
        </G>
      </PhoneMock>

      {/* 円形の吹き出し。端末に重ならないよう画面の外側に置く */}
      <G>
        <Circle
          cx={27}
          cy={72}
          r={26}
          fill={BODY}
          stroke={MUTED}
          strokeWidth={2}
        />
        <SvgText
          x={27}
          y={69}
          fill={INK}
          fontSize={10}
          fontWeight="bold"
          textAnchor="middle"
        >
          引っ張り
        </SvgText>
        <Rect x={14} y={76} width={26} height={6} rx={3} fill={MUTED} />
        <Rect x={14} y={76} width={21} height={6} rx={3} fill={BRAND} />
      </G>
      <G>
        <Circle
          cx={253}
          cy={140}
          r={25}
          fill={BODY}
          stroke={MUTED}
          strokeWidth={2}
        />
        <SvgText
          x={253}
          y={137}
          fill={INK}
          fontSize={10}
          fontWeight="bold"
          textAnchor="middle"
        >
          流し
        </SvgText>
        <Rect x={241} y={144} width={24} height={6} rx={3} fill={MUTED} />
        <Rect x={241} y={144} width={10} height={6} rx={3} fill={BRAND} />
      </G>
      <Sparkle x={236} y={30} size={9} />
    </ArtCanvas>
  );
}

interface CountPhoneProps {
  phone: { x: number; y: number; width: number; height: number };
  label: string;
  average: string;
  /** バーの充填率（0〜1）。打率の高低を図でも伝える。 */
  ratio: number;
  /** 打数・安打の内訳。画面を実物らしく見せるための添え書き。 */
  detail: string;
  /** ボールカウント（0〜3）。 */
  balls: number;
  /** ストライクカウント（0〜2）。 */
  strikes: number;
  /** 手前に置く主役の端末は文字と色を強める。 */
  emphasized?: boolean;
}

/**
 * カウント別スライドの 1 台。端末の画面に B/S のカウント・打率・バーを映す。
 * 位置は端末の寸法から導くので、大きさを変えても中身が崩れない。
 */
function CountPhone({
  phone,
  label,
  average,
  ratio,
  detail,
  balls,
  strikes,
  emphasized = false,
}: CountPhoneProps) {
  const bezel = phone.width * 0.045;
  const screenWidth = phone.width - bezel * 2;
  const centerX = phone.x + phone.width / 2;
  // ダイナミックアイランドの下端から順に積む。
  const islandBottom = phone.y + bezel * 1.9 + phone.width * 0.075;
  const labelY = islandBottom + (emphasized ? 20 : 17);
  const dotY = labelY + (emphasized ? 14 : 12);
  const dotRadius = emphasized ? 3 : 2.6;
  const averageY = dotY + (emphasized ? 30 : 25);
  const barY = averageY + (emphasized ? 10 : 8);
  const barWidth = screenWidth - 16;
  const barHeight = emphasized ? 8 : 6;
  const detailY = barY + (emphasized ? 22 : 18);
  return (
    <PhoneMock {...phone}>
      <SvgText
        x={centerX}
        y={labelY}
        fill={emphasized ? INK : SUB_INK}
        fontSize={emphasized ? 11 : 9.5}
        fontWeight="bold"
        textAnchor="middle"
      >
        {label}
      </SvgText>
      {/* ボール / ストライクのカウント表示 */}
      {[0, 1, 2].map((index) => (
        <Circle
          key={`ball-${index}`}
          cx={centerX - 20 + index * 9}
          cy={dotY}
          r={dotRadius}
          fill={index < balls ? "#4f9e6b" : "none"}
          stroke={MUTED}
          strokeWidth={1}
        />
      ))}
      {[0, 1].map((index) => (
        <Circle
          key={`strike-${index}`}
          cx={centerX + 9 + index * 9}
          cy={dotY}
          r={dotRadius}
          fill={index < strikes ? "#d64545" : "none"}
          stroke={MUTED}
          strokeWidth={1}
        />
      ))}
      <SvgText
        x={centerX}
        y={averageY}
        fill={emphasized ? INK : SUB_INK}
        fontSize={emphasized ? 24 : 18}
        fontWeight="bold"
        textAnchor="middle"
      >
        {average}
      </SvgText>
      <Rect
        x={centerX - barWidth / 2}
        y={barY}
        width={barWidth}
        height={barHeight}
        rx={barHeight / 2}
        fill={MUTED}
        opacity={0.6}
      />
      <Rect
        x={centerX - barWidth / 2}
        y={barY}
        width={barWidth * ratio}
        height={barHeight}
        rx={barHeight / 2}
        fill={BRAND}
        opacity={emphasized ? 1 : 0.55}
      />
      <SvgText
        x={centerX}
        y={detailY}
        fill={SUB_INK}
        fontSize={emphasized ? 8 : 7}
        textAnchor="middle"
      >
        {detail}
      </SvgText>
    </PhoneMock>
  );
}

/**
 * カウント別の打率。
 * 構図: 端末そのものを 3 台、扇状に並べて真ん中を大きく前に出す
 * （みてねの「1秒動画」型）。各画面に B/S のカウントと打率を映す。
 */
export function CountSituationArt() {
  return (
    <ArtCanvas>
      <Confetti
        items={[
          { cx: 20, cy: 30, r: 9, fill: BRAND, opacity: 0.22 },
          { cx: 260, cy: 160, r: 11, fill: "#5B8DEF", opacity: 0.2 },
        ]}
      />
      {/* 左右の端末は奥に、中央は手前に重ねる */}
      <G transform="rotate(-9 82 105)">
        <CountPhone
          phone={{ x: 48, y: 40, width: 68, height: 130 }}
          label="初球"
          average=".333"
          ratio={0.66}
          detail="9打数 3安打"
          balls={0}
          strikes={0}
        />
      </G>
      <G transform="rotate(9 198 105)">
        <CountPhone
          phone={{ x: 164, y: 40, width: 68, height: 130 }}
          label="追い込み"
          average=".208"
          ratio={0.4}
          detail="24打数 5安打"
          balls={0}
          strikes={2}
        />
      </G>
      <CountPhone
        phone={{ x: 101, y: 20, width: 78, height: 150 }}
        label="有利カウント"
        average=".412"
        ratio={0.86}
        detail="17打数 7安打"
        balls={2}
        strikes={0}
        emphasized
      />
      <Sparkle x={246} y={46} size={8} />
      <Sparkle x={28} y={154} size={7} color="#5B8DEF" />
    </ArtCanvas>
  );
}

/**
 * コース別の打率。
 * 構図: 端末の画面に 5x5 のコース別ヒートマップを映し、下にホームベースを置く。
 * 中央 3x3（ストライクゾーン）には打率を載せ、外周のボールゾーンは沈ませる。
 */
export function PitchCourseArt() {
  const bezel = PHONE.width * 0.045;
  const screenX = PHONE.x + bezel;
  const gridSize = 120;
  const gridX = PHONE.x + (PHONE.width - gridSize) / 2;
  const gridY = 50;
  const plateTop = gridY + gridSize + 3;
  // トラック比は実際のコース図（PITCH_COURSE_TRACK_FRACTIONS）と同じで、
  // 外周のボールゾーンだけ細くなる。
  const total = PITCH_COURSE_TRACK_FRACTIONS.reduce(
    (sum, fraction) => sum + fraction,
    0,
  );
  const sizes = PITCH_COURSE_TRACK_FRACTIONS.map(
    (fraction) => (fraction / total) * gridSize,
  );
  const offsets = sizes.reduce<number[]>(
    (acc, size, index) => [...acc, acc[index] + size],
    [0],
  );
  // ストライクゾーン 9 マスの打率（イラスト用のダミー値）。真ん中が得意、
  // 低め外寄りが苦手という読み取りやすい散らし方にする。
  const strikeAverages = [
    [0.333, 0.286, 0.2],
    [0.4, 0.476, 0.25],
    [0.214, 0.3, 0.118],
  ];
  // 色分けは実際のコース別カードと同じ固定閾値のスケールに揃える。
  const colorForAverage = (average: number): string => {
    if (average >= 0.45) return "#d64545";
    if (average >= 0.35) return "#d98236";
    if (average >= 0.25) return "#c9a227";
    if (average >= 0.15) return "#4f9e6b";
    return "#4173b3";
  };
  const formatAverage = (average: number): string =>
    average.toFixed(3).replace(/^0\./, ".");
  const zoneX = gridX + offsets[1];
  const zoneY = gridY + offsets[1];
  const zoneSize = offsets[4] - offsets[1];

  return (
    <ArtCanvas>
      <Confetti
        items={[
          { cx: 30, cy: 44, r: 10, fill: "#4F9E6B", opacity: 0.22 },
          { cx: 254, cy: 152, r: 9, fill: BRAND, opacity: 0.22 },
        ]}
      />
      <PhoneMock {...PHONE} showHomeIndicator={false}>
        <Rect
          x={screenX + 12}
          y={42}
          width={46}
          height={6}
          rx={3}
          fill={MUTED}
        />
        {/* ボールゾーンを含む 5x5 */}
        {sizes.map((cellHeight, row) =>
          sizes.map((cellWidth, col) => {
            const isStrike = row >= 1 && row <= 3 && col >= 1 && col <= 3;
            const average = isStrike
              ? strikeAverages[row - 1][col - 1]
              : undefined;
            const x = gridX + offsets[col];
            const y = gridY + offsets[row];
            return (
              <G key={`${row}-${col}`}>
                <Rect
                  x={x + 1}
                  y={y + 1}
                  width={cellWidth - 2}
                  height={cellHeight - 2}
                  rx={3}
                  fill={
                    average === undefined ? MUTED : colorForAverage(average)
                  }
                  opacity={average === undefined ? 0.35 : 0.92}
                />
                {average === undefined ? null : (
                  <SvgText
                    x={x + cellWidth / 2}
                    y={y + cellHeight / 2 + 3.2}
                    fill={INK}
                    fontSize={9}
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {formatAverage(average)}
                  </SvgText>
                )}
              </G>
            );
          }),
        )}
        {/* ストライクゾーンの枠 */}
        <Rect
          x={zoneX}
          y={zoneY}
          width={zoneSize}
          height={zoneSize}
          rx={4}
          fill="none"
          stroke={INK}
          strokeWidth={2}
          opacity={0.85}
        />
        {/* ホームベース（捕手目線） */}
        <Polygon
          points={`127,${plateTop} 153,${plateTop} 153,${plateTop + 7} 140,${plateTop + 14} 127,${plateTop + 7}`}
          fill={INK}
          opacity={0.85}
        />
      </PhoneMock>
      <Sparkle x={42} y={118} size={9} />
      <Sparkle x={244} y={50} size={8} color="#5B8DEF" />
    </ArtCanvas>
  );
}

/**
 * シーズン跨ぎの成績推移。
 * 構図: 左に端末が見切れ、右からグラフのカードが浮かび上がる（みてねの「バックグラウンド」型）。
 */
export function SeasonTrendArt() {
  const lastSeason = "124,120 146,112 168,116 190,104 212,106";
  const thisSeason = "124,110 146,92 168,84 190,70 212,54";
  return (
    <ArtCanvas>
      <Confetti
        items={[
          { cx: 246, cy: 158, r: 10, fill: "#5B8DEF", opacity: 0.22 },
          { cx: 34, cy: 28, r: 7, fill: BRAND, opacity: 0.22 },
        ]}
      />
      {/* 左で見切れる端末 */}
      <PhoneMock x={12} y={24} width={88} height={150}>
        <Rect x={26} y={46} width={38} height={6} rx={3} fill={MUTED} />
        <Rect x={26} y={58} width={24} height={5} rx={2.5} fill={MUTED} />
        {[76, 96, 116, 136].map((y) => (
          <Rect
            key={y}
            x={26}
            y={y}
            width={54}
            height={10}
            rx={5}
            fill={BRAND}
            opacity={0.18}
          />
        ))}
      </PhoneMock>

      {/* 奥に昨シーズンのカード、手前に今シーズンのカード */}
      <G transform="rotate(-7 176 104)">
        <Card
          x={98}
          y={44}
          width={150}
          height={112}
          fill={BODY}
          opacity={0.55}
        />
      </G>
      <G transform="rotate(5 176 100)">
        <Card x={106} y={32} width={148} height={116} />
        {[60, 90, 120].map((y) => (
          <Line
            key={y}
            x1={118}
            y1={y}
            x2={242}
            y2={y}
            stroke={MUTED}
            strokeWidth={1}
            opacity={0.55}
          />
        ))}
        <Polyline
          points={lastSeason}
          fill="none"
          stroke={MUTED}
          strokeWidth={2.5}
          strokeDasharray="5 4"
          strokeLinecap="round"
        />
        <Polyline
          points={thisSeason}
          fill="none"
          stroke={BRAND}
          strokeWidth={3.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {thisSeason.split(" ").map((point) => {
          const [cx, cy] = point.split(",");
          return (
            <Circle
              key={point}
              cx={Number(cx)}
              cy={Number(cy)}
              r={3.2}
              fill={BRAND}
            />
          );
        })}
        <SvgText x={118} y={140} fill={SUB_INK} fontSize={10}>
          昨シーズン
        </SvgText>
        <SvgText x={180} y={140} fill={BRAND} fontSize={10} fontWeight="bold">
          今シーズン
        </SvgText>
      </G>
      <Sparkle x={232} y={28} size={9} />
    </ArtCanvas>
  );
}

/**
 * 広告非表示。
 * 構図: 端末を中央に置き、右上から大きな禁止記号を重ねる（みてねの「広告なし」型）。
 */
export function NoAdsArt() {
  const phone = { x: 96, y: 8, width: 92, height: 174 };
  const contentX = phone.x + 12;
  const contentWidth = phone.width - 24;
  return (
    <ArtCanvas>
      <Confetti
        items={[
          { cx: 30, cy: 56, r: 11, fill: "#4F9E6B", opacity: 0.22 },
          { cx: 42, cy: 150, r: 7, fill: "#5B8DEF", opacity: 0.25 },
        ]}
      />
      <PhoneMock {...phone}>
        <Rect x={contentX} y={38} width={36} height={6} rx={3} fill={MUTED} />
        {/* 消える広告枠 */}
        <Rect
          x={contentX}
          y={54}
          width={contentWidth}
          height={32}
          rx={6}
          fill={MUTED}
          opacity={0.4}
        />
        <SvgText
          x={phone.x + phone.width / 2}
          y={75}
          fill={SUB_INK}
          fontSize={13}
          fontWeight="bold"
          textAnchor="middle"
        >
          広告
        </SvgText>
        {/* 広告が消えた先に記録が続く */}
        {[100, 118, 136, 154].map((y, index) => (
          <Rect
            key={y}
            x={contentX}
            y={y}
            width={index === 1 ? 40 : contentWidth}
            height={8}
            rx={4}
            fill={BRAND}
            opacity={index === 1 ? 0.55 : 0.26}
          />
        ))}
      </PhoneMock>
      {/* 禁止記号 */}
      <G>
        <Circle
          cx={198}
          cy={58}
          r={30}
          fill="#2E2E2E"
          stroke={BRAND}
          strokeWidth={3.5}
        />
        <Line
          x1={177}
          y1={79}
          x2={219}
          y2={37}
          stroke={BRAND}
          strokeWidth={3.5}
          strokeLinecap="round"
        />
      </G>
      <Sparkle x={242} y={116} size={10} />
      <Sparkle x={224} y={150} size={7} color="#5B8DEF" />
    </ArtCanvas>
  );
}

const styles = StyleSheet.create({
  canvas: {
    width: "100%",
    height: SLIDE_ART_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
});

import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, {
  Circle,
  ClipPath,
  Defs,
  Ellipse,
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

/**
 * 投手のシルエット。踏み出して腕を振り出す瞬間の、脚を大きく割った投球フォーム。
 * 打者と同じく単色で描き、手前に重なる腕と脚は背景色の縁取りで前後を出す。
 */
function PitcherSilhouette() {
  const silhouette = "#5A6275";
  const gap = "#2E2E2E";
  return (
    <G>
      {/* 後ろ足（蹴り出した側） */}
      <Polyline
        points="48,106 32,128 17,148"
        fill="none"
        stroke={silhouette}
        strokeWidth={14}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Ellipse
        cx={13}
        cy={152}
        rx={10}
        ry={5}
        fill={silhouette}
        transform="rotate(-25 13 152)"
      />
      {/* 胴体 */}
      <Path
        d="M 43,68 Q 54,60 66,68 L 63,106 Q 53,112 41,105 Z"
        fill={silhouette}
      />
      {/* 踏み出した前脚 */}
      <Polyline
        points="60,106 78,126 94,148"
        fill="none"
        stroke={gap}
        strokeWidth={18}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Polyline
        points="60,106 78,126 94,148"
        fill="none"
        stroke={silhouette}
        strokeWidth={14}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Ellipse
        cx={99}
        cy={152}
        rx={10}
        ry={5}
        fill={silhouette}
        transform="rotate(30 99 152)"
      />
      {/* 振りかぶった投げ手とボール */}
      <Polyline
        points="45,72 29,63 23,45"
        fill="none"
        stroke={silhouette}
        strokeWidth={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={21} cy={40} r={5.5} fill="#F1F1F0" />
      {/* 前へ伸ばしたグラブ側の腕 */}
      <Polyline
        points="65,72 79,70 90,68"
        fill="none"
        stroke={gap}
        strokeWidth={14}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Polyline
        points="65,72 79,70 90,68"
        fill="none"
        stroke={silhouette}
        strokeWidth={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={94} cy={67} r={8} fill={silhouette} />
      {/* 帽子をかぶった頭（つばは打者の方＝右へ） */}
      <Circle cx={54} cy={54} r={12} fill={silhouette} />
      <Path d="M 63,49.5 L 75,54 L 63,58.5 Z" fill={silhouette} />
    </G>
  );
}

/**
 * 対戦投手別の打撃成績。
 * 構図: 左に投手のシルエット、右に「その投手との通算成績」を大きく置く。
 * 下に他の投手を並べ、投手ごとに成績が積み上がることを示す。
 */
export function PitcherFaceoffArt() {
  // 色分けは他の成績スライドと同じ固定閾値のスケールに揃える。
  const colorForAverage = (average: number): string => {
    if (average >= 0.45) return "#d64545";
    if (average >= 0.35) return "#d98236";
    if (average >= 0.25) return "#c9a227";
    if (average >= 0.15) return "#4f9e6b";
    return "#4173b3";
  };
  const formatAverage = (average: number): string =>
    average.toFixed(3).replace(/^0\./, ".");
  const others = [
    { y: 116, name: "投手 B", meta: "△△高校・左投げ", average: 0.286 },
    { y: 154, name: "投手 C", meta: "□□高校・右投げ", average: 0.15 },
  ];

  return (
    <ArtCanvas>
      <Confetti
        items={[
          { cx: 20, cy: 168, r: 10, fill: "#4F9E6B", opacity: 0.2 },
          { cx: 264, cy: 16, r: 8, fill: BRAND, opacity: 0.22 },
        ]}
      />
      <PitcherSilhouette />
      <SvgText
        x={112}
        y={72}
        fill={SUB_INK}
        fontSize={14}
        fontWeight="bold"
        textAnchor="middle"
      >
        VS
      </SvgText>

      {/* その投手との通算成績 */}
      <Card x={126} y={16} width={146} height={90} fill="#2E2E30" />
      <SvgText x={138} y={38} fill={INK} fontSize={12} fontWeight="bold">
        投手 A
      </SvgText>
      <SvgText x={138} y={54} fill={SUB_INK} fontSize={9}>
        〇〇高校・右投げ・パワー
      </SvgText>
      <SvgText
        x={138}
        y={90}
        fill={colorForAverage(0.421)}
        fontSize={32}
        fontWeight="bold"
      >
        .421
      </SvgText>
      <SvgText x={264} y={90} fill={SUB_INK} fontSize={9} textAnchor="end">
        19打数 8安打
      </SvgText>

      {/* 他の投手との成績も積み上がる */}
      {others.map((row) => (
        <G key={row.y}>
          <Card x={126} y={row.y} width={146} height={34} fill={CARD_BG} />
          {/* 人アイコン */}
          <Circle cx={145} cy={row.y + 17} r={11} fill={BODY} />
          <Circle cx={145} cy={row.y + 13.5} r={4} fill={SUB_INK} />
          <Path d={`M 138,${row.y + 24} a 7,7 0 0 1 14,0 Z`} fill={SUB_INK} />
          <SvgText
            x={162}
            y={row.y + 16}
            fill={INK}
            fontSize={10.5}
            fontWeight="bold"
          >
            {row.name}
          </SvgText>
          <SvgText x={162} y={row.y + 28} fill={SUB_INK} fontSize={8}>
            {row.meta}
          </SvgText>
          <SvgText
            x={264}
            y={row.y + 23}
            fill={colorForAverage(row.average)}
            fontSize={18}
            fontWeight="bold"
            textAnchor="end"
          >
            {formatAverage(row.average)}
          </SvgText>
        </G>
      ))}
      <Sparkle x={112} y={128} size={8} />
    </ArtCanvas>
  );
}

interface PitchBallProps {
  cx: number;
  cy: number;
  r: number;
  /** 打率に応じた縁の色。 */
  ringColor: string;
  /** 縫い目の傾き（度）。球種ごとの握り・回転の向きに合わせる。 */
  seamRotation: number;
}

/** 球のイラスト。白い円に赤い縫い目を 2 本入れ、球種ごとに縫い目を傾ける。 */
function PitchBall({ cx, cy, r, ringColor, seamRotation }: PitchBallProps) {
  const seamOffset = r * 0.58;
  const seamReach = r * 0.78;
  const stitchYs = [-0.42, 0, 0.42];
  return (
    <G>
      <Circle
        cx={cx}
        cy={cy}
        r={r}
        fill="#F1F1F0"
        stroke={ringColor}
        strokeWidth={3}
      />
      <G transform={`rotate(${seamRotation} ${cx} ${cy})`}>
        {[-1, 1].map((side) => (
          <G key={side}>
            <Path
              d={`M ${cx + side * seamOffset},${cy - seamReach} Q ${cx + side * r * 0.12},${cy} ${cx + side * seamOffset},${cy + seamReach}`}
              fill="none"
              stroke="#d64545"
              strokeWidth={1.6}
              strokeLinecap="round"
            />
            {stitchYs.map((ratio) => (
              <Line
                key={ratio}
                x1={cx + side * (seamOffset - r * 0.16)}
                y1={cy + r * ratio - r * 0.06}
                x2={cx + side * (seamOffset + r * 0.14)}
                y2={cy + r * ratio + r * 0.06}
                stroke="#d64545"
                strokeWidth={1.2}
                strokeLinecap="round"
              />
            ))}
          </G>
        ))}
      </G>
    </G>
  );
}

/**
 * 球種別の打率。
 * 構図: 球種ごとのボールを 2x2 に並べ、それぞれに打率と打数安打を添える。
 * 端末を使わない唯一のスライドで、球種の並びが一目で比べられる。
 */
export function PitchTypeArt() {
  // seamRotation は球種の握り・回転の向きに合わせる。
  // ストレートは縦、フォークは指を割って握るため横。
  // スライダーとカーブは斜めに握るので、互いに逆向きへ傾ける。
  const pitches = [
    {
      cx: 42,
      cy: 50,
      r: 26,
      textX: 78,
      name: "ストレート",
      average: 0.368,
      detail: "38打数 14安打",
      seamRotation: 0,
    },
    {
      cx: 176,
      cy: 50,
      r: 23,
      textX: 209,
      name: "スライダー",
      average: 0.25,
      detail: "24打数 6安打",
      seamRotation: 45,
    },
    {
      cx: 42,
      cy: 136,
      r: 23,
      textX: 78,
      name: "カーブ",
      average: 0.188,
      detail: "16打数 3安打",
      seamRotation: -35,
    },
    {
      cx: 176,
      cy: 136,
      r: 23,
      textX: 209,
      name: "フォーク",
      average: 0.143,
      detail: "14打数 2安打",
      seamRotation: 90,
    },
  ];
  // 色分けは他の成績スライドと同じ固定閾値のスケールに揃える。
  const colorForAverage = (average: number): string => {
    if (average >= 0.45) return "#d64545";
    if (average >= 0.35) return "#d98236";
    if (average >= 0.25) return "#c9a227";
    if (average >= 0.15) return "#4f9e6b";
    return "#4173b3";
  };
  const formatAverage = (average: number): string =>
    average.toFixed(3).replace(/^0\./, ".");

  return (
    <ArtCanvas>
      <Confetti
        items={[
          { cx: 140, cy: 24, r: 8, fill: BRAND, opacity: 0.2 },
          { cx: 136, cy: 168, r: 10, fill: "#5B8DEF", opacity: 0.2 },
        ]}
      />
      {pitches.map((pitch) => {
        const color = colorForAverage(pitch.average);
        return (
          <G key={pitch.name}>
            <PitchBall
              cx={pitch.cx}
              cy={pitch.cy}
              r={pitch.r}
              ringColor={color}
              seamRotation={pitch.seamRotation}
            />
            <SvgText
              x={pitch.textX}
              y={pitch.cy - 10}
              fill={INK}
              fontSize={13}
              fontWeight="bold"
            >
              {pitch.name}
            </SvgText>
            <SvgText
              x={pitch.textX}
              y={pitch.cy + 14}
              fill={color}
              fontSize={22}
              fontWeight="bold"
            >
              {formatAverage(pitch.average)}
            </SvgText>
            <SvgText
              x={pitch.textX}
              y={pitch.cy + 28}
              fill={SUB_INK}
              fontSize={8.5}
            >
              {pitch.detail}
            </SvgText>
          </G>
        );
      })}
      <Sparkle x={112} y={98} size={9} />
      <Sparkle x={250} y={104} size={7} color="#5B8DEF" />
    </ArtCanvas>
  );
}

interface CountRowProps {
  y: number;
  label: string;
  detail: string;
  /** 点灯するボールカウント（0〜3）。 */
  balls: number;
  /** 点灯するストライクカウント（0〜2）。 */
  strikes: number;
  average: number;
  averageColor: string;
  /** 主役の行はブランド色で囲って目線を集める。 */
  highlighted?: boolean;
}

/** スコアボード風の 1 行。カウントのランプと打率を横に並べる。 */
function CountRow({
  y,
  label,
  detail,
  balls,
  strikes,
  average,
  averageColor,
  highlighted = false,
}: CountRowProps) {
  const lampY = y + 24;
  const formatted = average.toFixed(3).replace(/^0\./, ".");
  return (
    <G>
      <Rect
        x={22}
        y={y}
        width={236}
        height={46}
        rx={10}
        fill={highlighted ? "rgba(208, 128, 0, 0.14)" : CARD_BG}
        stroke={highlighted ? BRAND : CARD_EDGE}
        strokeWidth={highlighted ? 1.5 : 1}
      />
      <SvgText x={36} y={y + 21} fill={INK} fontSize={12} fontWeight="bold">
        {label}
      </SvgText>
      <SvgText x={36} y={y + 37} fill={SUB_INK} fontSize={9}>
        {detail}
      </SvgText>
      {/* ボールカウントのランプ */}
      <SvgText x={106} y={lampY + 4} fill={SUB_INK} fontSize={10}>
        B
      </SvgText>
      {[0, 1, 2].map((index) => (
        <Circle
          key={`ball-${index}`}
          cx={124 + index * 13}
          cy={lampY}
          r={5.5}
          fill={index < balls ? "#4f9e6b" : "#1B1B1E"}
          stroke={MUTED}
          strokeWidth={1}
        />
      ))}
      {/* ストライクカウントのランプ */}
      <SvgText x={156} y={lampY + 4} fill={SUB_INK} fontSize={10}>
        S
      </SvgText>
      {[0, 1].map((index) => (
        <Circle
          key={`strike-${index}`}
          cx={174 + index * 13}
          cy={lampY}
          r={5.5}
          fill={index < strikes ? "#d64545" : "#1B1B1E"}
          stroke={MUTED}
          strokeWidth={1}
        />
      ))}
      <SvgText
        x={252}
        y={y + 32}
        fill={averageColor}
        fontSize={26}
        fontWeight="bold"
        textAnchor="end"
      >
        {formatted}
      </SvgText>
    </G>
  );
}

/**
 * カウント別の打率。
 * 構図: スコアボードのカウント表示をそのまま 3 段並べ、B/S のランプごとに打率を置く。
 * ランプを見れば「どのカウントの成績か」が説明なしで伝わる。
 */
export function CountSituationArt() {
  return (
    <ArtCanvas>
      <Confetti
        items={[
          { cx: 266, cy: 12, r: 9, fill: BRAND, opacity: 0.2 },
          { cx: 14, cy: 178, r: 10, fill: "#5B8DEF", opacity: 0.18 },
        ]}
      />
      {/* スコアボードの盤面 */}
      <Rect
        x={12}
        y={14}
        width={256}
        height={164}
        rx={14}
        fill="#1B1B1E"
        stroke={CARD_EDGE}
        strokeWidth={1.5}
      />
      <CountRow
        y={24}
        label="初球"
        detail="9打数 3安打"
        balls={0}
        strikes={0}
        average={0.333}
        averageColor="#c9a227"
      />
      <CountRow
        y={76}
        label="有利カウント"
        detail="17打数 7安打"
        balls={2}
        strikes={0}
        average={0.412}
        averageColor="#d98236"
        highlighted
      />
      <CountRow
        y={128}
        label="追い込み"
        detail="24打数 5安打"
        balls={0}
        strikes={2}
        average={0.208}
        averageColor="#4f9e6b"
      />
    </ArtCanvas>
  );
}

/**
 * 捕手目線の右打者（後ろ姿）。ストライクゾーンの左（三塁側）の打席に立ち、
 * 投手の方を向いているため背中側が見える。
 *
 * 野球のピクトグラムに倣い単色のシルエットで描く。手前に重なる腕とバットは
 * 背景色の縁取りを一段太く敷いて、単色でも前後が分かるようにする。
 */
function RightHandedBatter() {
  const silhouette = "#5A6275";
  // 背景と同じ色で縁取り、重なった部位の境目を作る。
  const gap = "#2E2E2E";
  return (
    <G>
      {/* バット（グリッドの左上に重なる） */}
      <Line
        x1={92}
        y1={50}
        x2={124}
        y2={8}
        stroke={gap}
        strokeWidth={15}
        strokeLinecap="round"
      />
      <Line
        x1={92}
        y1={50}
        x2={124}
        y2={8}
        stroke={silhouette}
        strokeWidth={10}
        strokeLinecap="round"
      />
      {/* 背中側の胴体。肩幅が広く腰へ絞る */}
      <Path
        d="M 30,62 Q 50,51 70,62 L 64,104 Q 49,111 33,103 Z"
        fill={silhouette}
      />
      {/* 両脚。打席では前後に大きく開くため、膝を曲げて左右へ広げる */}
      <Polyline
        points="42,102 35,132 30,161"
        fill="none"
        stroke={silhouette}
        strokeWidth={15}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* 手前（投手側）の脚は少し太くして前後を出す */}
      <Polyline
        points="60,102 70,130 77,159"
        fill="none"
        stroke={silhouette}
        strokeWidth={16}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* スパイク。つま先は投手側へ向く */}
      <Ellipse
        cx={32}
        cy={166}
        rx={11.5}
        ry={5.5}
        fill={silhouette}
        transform="rotate(12 32 166)"
      />
      <Ellipse
        cx={79}
        cy={164}
        rx={11.5}
        ry={5.5}
        fill={silhouette}
        transform="rotate(-8 79 164)"
      />
      {/* 奥の腕（右肩からグリップへ） */}
      <Polyline
        points="68,66 80,58 88,54"
        fill="none"
        stroke={silhouette}
        strokeWidth={12}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* 手前の腕は背中を横切るため縁取りで分ける */}
      <Polyline
        points="36,70 64,66 88,56"
        fill="none"
        stroke={gap}
        strokeWidth={15}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Polyline
        points="36,70 64,66 88,56"
        fill="none"
        stroke={silhouette}
        strokeWidth={11}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* グリップを握る手 */}
      <Circle cx={90} cy={52} r={8} fill={silhouette} />
      {/* ヘルメット。後ろ姿なのでつばは見えず、両耳のイヤーフラップが出る */}
      <Circle cx={37} cy={44} r={5.5} fill={silhouette} />
      <Circle cx={63} cy={44} r={5.5} fill={silhouette} />
      <Circle cx={50} cy={40} r={15} fill={silhouette} />
    </G>
  );
}

/**
 * コース別の打率。
 * 構図: 捕手目線で右打者の前に 5x5 のヒートマップを置き、下にホームベース、
 * 右下に得意ゾーンのカードを飛び出させる。端末は使わない。
 */
export function PitchCourseArt() {
  const gridSize = 112;
  const gridX = 100;
  const gridY = 22;
  const plateTop = gridY + gridSize + 6;
  const plateCenterX = gridX + gridSize / 2;
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
          { cx: 24, cy: 28, r: 10, fill: "#4F9E6B", opacity: 0.22 },
          { cx: 258, cy: 42, r: 8, fill: BRAND, opacity: 0.25 },
        ]}
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
                fill={average === undefined ? MUTED : colorForAverage(average)}
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
        points={`${plateCenterX - 13},${plateTop} ${plateCenterX + 13},${plateTop} ${plateCenterX + 13},${plateTop + 7} ${plateCenterX},${plateTop + 14} ${plateCenterX - 13},${plateTop + 7}`}
        fill={INK}
        opacity={0.85}
      />
      {/* 打者はグリッドの後に描き、バットをゾーンの左上へ重ねる */}
      <RightHandedBatter />

      {/* 得意ゾーンを飛び出させたカード */}
      <G transform="rotate(-5 226 164)">
        <Card x={180} y={138} width={92} height={52} fill="#2E2E30" />
        {[0, 1, 2].map((row) =>
          [0, 1, 2].map((col) => {
            const isCenter = row === 1 && col === 1;
            return (
              <Rect
                key={`${row}-${col}`}
                x={190 + col * 9}
                y={150 + row * 9}
                width={7.5}
                height={7.5}
                rx={2}
                fill={isCenter ? "#d64545" : MUTED}
                opacity={isCenter ? 1 : 0.5}
              />
            );
          }),
        )}
        <SvgText
          x={240}
          y={166}
          fill="#d64545"
          fontSize={20}
          fontWeight="bold"
          textAnchor="middle"
        >
          .476
        </SvgText>
        <SvgText
          x={226}
          y={183}
          fill={SUB_INK}
          fontSize={8.5}
          textAnchor="middle"
        >
          真ん中・ストライク
        </SvgText>
      </G>
      <Sparkle x={126} y={172} size={8} />
    </ArtCanvas>
  );
}

/**
 * シーズン跨ぎの成績推移。
 * 構図: 端末を使わず折れ線を大きく描き、2 シーズンを重ねて伸びを見せる。
 * 右上に伸び幅のバッジを置き、下の凡例に各シーズンの打率を添える。
 */
export function SeasonTrendArt() {
  const chart = { left: 50, right: 252, top: 28, bottom: 128 };
  const minAverage = 0.2;
  const maxAverage = 0.4;
  const xFor = (index: number, count: number) =>
    chart.left + ((chart.right - chart.left) / (count - 1)) * index;
  const yFor = (average: number) =>
    chart.bottom -
    ((average - minAverage) / (maxAverage - minAverage)) *
      (chart.bottom - chart.top);
  const lastSeason = [0.24, 0.262, 0.255, 0.275, 0.268];
  const thisSeason = [0.285, 0.31, 0.322, 0.335, 0.341];
  const toPoints = (values: number[]) =>
    values
      .map(
        (value, index) =>
          `${xFor(index, values.length).toFixed(1)},${yFor(value).toFixed(1)}`,
      )
      .join(" ");

  return (
    <ArtCanvas>
      <Confetti
        items={[
          { cx: 20, cy: 24, r: 9, fill: "#5B8DEF", opacity: 0.2 },
          { cx: 264, cy: 168, r: 10, fill: BRAND, opacity: 0.18 },
        ]}
      />
      {/* 目盛り */}
      {[0.4, 0.3, 0.2].map((tick) => (
        <G key={tick}>
          <Line
            x1={chart.left}
            y1={yFor(tick)}
            x2={chart.right}
            y2={yFor(tick)}
            stroke={MUTED}
            strokeWidth={1}
            opacity={0.55}
          />
          <SvgText
            x={chart.left - 8}
            y={yFor(tick) + 3.5}
            fill={SUB_INK}
            fontSize={9}
            textAnchor="end"
          >
            {tick.toFixed(3).replace(/^0\./, ".")}
          </SvgText>
        </G>
      ))}

      {/* 昨シーズン（破線） */}
      <Polyline
        points={toPoints(lastSeason)}
        fill="none"
        stroke={MUTED}
        strokeWidth={3}
        strokeDasharray="6 5"
        strokeLinecap="round"
      />
      {/* 今シーズン（実線） */}
      <Polyline
        points={toPoints(thisSeason)}
        fill="none"
        stroke={BRAND}
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {thisSeason.map((value, index) => (
        <Circle
          key={value}
          cx={xFor(index, thisSeason.length)}
          cy={yFor(value)}
          r={4.5}
          fill={BRAND}
        />
      ))}

      {/* 伸び幅のバッジ */}
      <G>
        <Rect
          x={194}
          y={20}
          width={64}
          height={26}
          rx={13}
          fill="rgba(208, 128, 0, 0.18)"
          stroke={BRAND}
          strokeWidth={1.5}
        />
        {/* 上向き三角が「伸びた」を表すので、数値に + は付けない */}
        <Polygon points="202,37 208,26 214,37" fill={BRAND} />
        <SvgText
          x={250}
          y={38}
          fill={BRAND}
          fontSize={14}
          fontWeight="bold"
          textAnchor="end"
        >
          .073
        </SvgText>
      </G>

      {/* 凡例 */}
      <Line
        x1={24}
        y1={156}
        x2={46}
        y2={156}
        stroke={MUTED}
        strokeWidth={3}
        strokeDasharray="6 5"
        strokeLinecap="round"
      />
      <SvgText x={52} y={160} fill={SUB_INK} fontSize={11}>
        昨シーズン .268
      </SvgText>
      <Line
        x1={150}
        y1={156}
        x2={172}
        y2={156}
        stroke={BRAND}
        strokeWidth={4}
        strokeLinecap="round"
      />
      <SvgText x={178} y={160} fill={INK} fontSize={11} fontWeight="bold">
        今シーズン .341
      </SvgText>
    </ArtCanvas>
  );
}

/**
 * 広告非表示。
 * 構図: 端末の画面から広告枠が消えることを、大きな禁止記号で示す。
 * 枠の下には記録が続き、加入後は入力の手が止まらないことを表す。
 */
export function NoAdsArt() {
  const bezel = PHONE.width * 0.045;
  const screenX = PHONE.x + bezel;
  const contentX = screenX + 12;
  const contentWidth = PHONE.width - bezel * 2 - 24;
  return (
    <ArtCanvas>
      <Confetti
        items={[
          { cx: 24, cy: 46, r: 11, fill: "#4F9E6B", opacity: 0.22 },
          { cx: 34, cy: 158, r: 8, fill: "#5B8DEF", opacity: 0.25 },
        ]}
      />
      <PhoneMock {...PHONE} showHomeIndicator={false}>
        <Rect x={contentX} y={44} width={46} height={6} rx={3} fill={MUTED} />
        {/* 消える広告枠 */}
        <Rect
          x={contentX}
          y={58}
          width={contentWidth}
          height={44}
          rx={8}
          fill={MUTED}
          opacity={0.35}
        />
        <SvgText
          x={PHONE.x + PHONE.width / 2}
          y={88}
          fill={SUB_INK}
          fontSize={22}
          fontWeight="bold"
          textAnchor="middle"
        >
          広告
        </SvgText>
        {/* 広告が消えた先に記録が続く */}
        {[120, 140, 160].map((y, index) => (
          <Rect
            key={y}
            x={contentX}
            y={y}
            width={index === 1 ? 52 : contentWidth}
            height={10}
            rx={5}
            fill={BRAND}
            opacity={index === 1 ? 0.55 : 0.26}
          />
        ))}
      </PhoneMock>
      {/* 禁止記号。端末からはみ出させて主役にする */}
      <G>
        <Circle
          cx={202}
          cy={80}
          r={40}
          fill="none"
          stroke={BRAND}
          strokeWidth={5}
        />
        <Line
          x1={174}
          y1={108}
          x2={230}
          y2={52}
          stroke={BRAND}
          strokeWidth={5}
          strokeLinecap="round"
        />
      </G>
      <Sparkle x={40} y={104} size={10} />
      <Sparkle x={252} y={150} size={8} color="#5B8DEF" />
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

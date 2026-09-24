import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  LinearGradient,
  Path,
  Polygon,
  Polyline,
  Rect,
  Stop,
  Text as SvgText,
} from "react-native-svg";

/**
 * Paywall スライドの機能紹介イラスト。
 *
 * 実際の分析コンポーネントやユーザーのデータは一切使わず、機能の雰囲気だけを
 * 伝える簡略図を iPhone モックにはめ込む。Paywall で本物の分析を描画すると
 * 未加入のまま中身が見えてしまうため、ここは常に作り物に留める。
 */

// 全スライド共通のキャンバス。高さは端末の縦幅を圧迫しない範囲で固定する。
const CANVAS_WIDTH = 280;
const CANVAS_HEIGHT = 190;
export const SLIDE_ART_HEIGHT = 190;

// 画面中央に置く端末モックの外形と、その内側の「画面」領域。
const PHONE = { x: 92, y: 6, width: 96, height: 178, radius: 14 };
const SCREEN = { x: 98, y: 18, width: 84, height: 154, radius: 10 };

const BRAND = "#d08000";
const PHONE_BODY = "#3F3F46";
const SCREEN_BG = "#1F1F22";
const MUTED = "#52525B";

interface DecorationCircle {
  cx: number;
  cy: number;
  r: number;
  fill: string;
  opacity: number;
}

// 背景の飾り。ブランド色と補色を散らして、静止画でも華やかに見せる。
const DECORATIONS: readonly DecorationCircle[] = [
  { cx: 34, cy: 30, r: 13, fill: BRAND, opacity: 0.22 },
  { cx: 246, cy: 44, r: 9, fill: "#5B8DEF", opacity: 0.22 },
  { cx: 252, cy: 148, r: 15, fill: BRAND, opacity: 0.14 },
  { cx: 28, cy: 154, r: 8, fill: "#4F9E6B", opacity: 0.22 },
  { cx: 60, cy: 92, r: 5, fill: "#F4F4F4", opacity: 0.12 },
  { cx: 222, cy: 96, r: 4, fill: "#F4F4F4", opacity: 0.12 },
];

/** 端末モックの外枠。各イラストはこの内側に描く。 */
function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <G>
      <Rect
        x={PHONE.x}
        y={PHONE.y}
        width={PHONE.width}
        height={PHONE.height}
        rx={PHONE.radius}
        fill={PHONE_BODY}
      />
      <Rect
        x={SCREEN.x}
        y={SCREEN.y}
        width={SCREEN.width}
        height={SCREEN.height}
        rx={SCREEN.radius}
        fill={SCREEN_BG}
      />
      {/* スピーカー */}
      <Rect
        x={PHONE.x + PHONE.width / 2 - 11}
        y={PHONE.y + 5}
        width={22}
        height={3}
        rx={1.5}
        fill={MUTED}
      />
      {children}
    </G>
  );
}

/** 画面上部に置く、内容を問わないヘッダー風の線。 */
function ScreenHeaderLines() {
  return (
    <G opacity={0.6}>
      <Rect
        x={SCREEN.x + 10}
        y={SCREEN.y + 12}
        width={34}
        height={5}
        rx={2.5}
        fill={MUTED}
      />
      <Rect
        x={SCREEN.x + 10}
        y={SCREEN.y + 22}
        width={22}
        height={4}
        rx={2}
        fill={MUTED}
      />
    </G>
  );
}

function Decorations() {
  return (
    <G>
      {DECORATIONS.map((decoration) => (
        <Circle
          key={`${decoration.cx}-${decoration.cy}`}
          cx={decoration.cx}
          cy={decoration.cy}
          r={decoration.r}
          fill={decoration.fill}
          opacity={decoration.opacity}
        />
      ))}
    </G>
  );
}

/** 四方に光る装飾。加入後の体験が「特別」に見えるようにする。 */
function Sparkle({ x, y, size }: { x: number; y: number; size: number }) {
  const points = [
    `${x},${y - size}`,
    `${x + size * 0.28},${y - size * 0.28}`,
    `${x + size},${y}`,
    `${x + size * 0.28},${y + size * 0.28}`,
    `${x},${y + size}`,
    `${x - size * 0.28},${y + size * 0.28}`,
    `${x - size},${y}`,
    `${x - size * 0.28},${y - size * 0.28}`,
  ].join(" ");
  return <Polygon points={points} fill={BRAND} opacity={0.9} />;
}

interface ArtCanvasProps {
  children: React.ReactNode;
}

function ArtCanvas({ children }: ArtCanvasProps) {
  return (
    <View style={styles.canvas}>
      <Svg
        width="100%"
        height={CANVAS_HEIGHT}
        viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
      >
        <Decorations />
        {children}
      </Svg>
    </View>
  );
}

/** 方向別の打率。球場図の上に打球方向のヒートを置いた簡略図。 */
export function HitDirectionArt() {
  const home = { x: 140, y: 152 };
  const zones = [
    { cx: 118, cy: 92, r: 13, opacity: 0.9 },
    { cx: 140, cy: 74, r: 11, opacity: 0.55 },
    { cx: 162, cy: 92, r: 12, opacity: 0.75 },
    { cx: 124, cy: 122, r: 9, opacity: 0.35 },
    { cx: 156, cy: 122, r: 9, opacity: 0.5 },
  ];
  return (
    <ArtCanvas>
      <PhoneFrame>
        <ScreenHeaderLines />
        {/* 外野のふくらみとファウルライン */}
        <Path
          d={`M ${home.x} ${home.y} L 104 62 A 40 40 0 0 1 176 62 Z`}
          fill="#2F6B45"
          opacity={0.45}
        />
        <Line
          x1={home.x}
          y1={home.y}
          x2={104}
          y2={62}
          stroke="#F4F4F4"
          strokeWidth={1}
          opacity={0.5}
        />
        <Line
          x1={home.x}
          y1={home.y}
          x2={176}
          y2={62}
          stroke="#F4F4F4"
          strokeWidth={1}
          opacity={0.5}
        />
        {zones.map((zone) => (
          <Circle
            key={`${zone.cx}-${zone.cy}`}
            cx={zone.cx}
            cy={zone.cy}
            r={zone.r}
            fill={BRAND}
            opacity={zone.opacity}
          />
        ))}
        <Circle cx={home.x} cy={home.y} r={3} fill="#F4F4F4" opacity={0.8} />
      </PhoneFrame>
      <Sparkle x={62} y={60} size={9} />
      <Sparkle x={220} y={140} size={7} />
    </ArtCanvas>
  );
}

/** カウント別の打率。3 本の棒で状況ごとの差を示す。 */
export function CountSituationArt() {
  const bars = [
    { x: 108, height: 40, opacity: 0.45 },
    { x: 132, height: 62, opacity: 1 },
    { x: 156, height: 30, opacity: 0.35 },
  ];
  const baseline = 150;
  return (
    <ArtCanvas>
      <PhoneFrame>
        <ScreenHeaderLines />
        {bars.map((bar) => (
          <G key={bar.x}>
            <Rect
              x={bar.x}
              y={baseline - bar.height}
              width={17}
              height={bar.height}
              rx={4}
              fill={BRAND}
              opacity={bar.opacity}
            />
            <Rect
              x={bar.x}
              y={baseline + 6}
              width={17}
              height={4}
              rx={2}
              fill={MUTED}
            />
          </G>
        ))}
        <Line
          x1={SCREEN.x + 6}
          y1={baseline}
          x2={SCREEN.x + SCREEN.width - 6}
          y2={baseline}
          stroke={MUTED}
          strokeWidth={1}
        />
      </PhoneFrame>
      <Sparkle x={64} y={128} size={8} />
      <Sparkle x={218} y={56} size={7} />
    </ArtCanvas>
  );
}

/** コース別の打率。ストライクゾーンの 3x3 ヒートマップ。 */
export function PitchCourseArt() {
  const cellSize = 20;
  const gap = 3;
  const originX = 108;
  const originY = 66;
  // 真ん中〜内寄りが得意、外角低めが苦手という分かりやすい濃淡にする。
  const opacities = [0.3, 0.55, 0.2, 0.7, 1, 0.45, 0.4, 0.6, 0.15];
  return (
    <ArtCanvas>
      <PhoneFrame>
        <ScreenHeaderLines />
        {opacities.map((opacity, index) => {
          const row = Math.floor(index / 3);
          const col = index % 3;
          return (
            <Rect
              key={index}
              x={originX + col * (cellSize + gap)}
              y={originY + row * (cellSize + gap)}
              width={cellSize}
              height={cellSize}
              rx={4}
              fill={BRAND}
              opacity={opacity}
            />
          );
        })}
        <Rect
          x={originX - 5}
          y={originY - 5}
          width={3 * cellSize + 2 * gap + 10}
          height={3 * cellSize + 2 * gap + 10}
          rx={6}
          fill="none"
          stroke="#F4F4F4"
          strokeWidth={1.2}
          opacity={0.55}
        />
      </PhoneFrame>
      <Sparkle x={60} y={70} size={9} />
      <Sparkle x={224} y={132} size={7} />
    </ArtCanvas>
  );
}

/** シーズン跨ぎの成績推移。過去と今季の 2 本を重ねる。 */
export function SeasonTrendArt() {
  const lastSeason = "108,132 122,124 136,128 150,116 170,118";
  const thisSeason = "108,120 122,104 136,96 150,84 170,68";
  return (
    <ArtCanvas>
      <PhoneFrame>
        <ScreenHeaderLines />
        {[66, 96, 126, 150].map((y) => (
          <Line
            key={y}
            x1={SCREEN.x + 6}
            y1={y}
            x2={SCREEN.x + SCREEN.width - 6}
            y2={y}
            stroke={MUTED}
            strokeWidth={1}
            opacity={0.5}
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
          strokeWidth={3}
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
              r={3}
              fill={BRAND}
            />
          );
        })}
      </PhoneFrame>
      <Sparkle x={222} y={52} size={9} />
      <Sparkle x={62} y={140} size={7} />
    </ArtCanvas>
  );
}

/** 広告非表示。画面上の広告枠が消えることを示す。 */
export function NoAdsArt() {
  return (
    <ArtCanvas>
      <Defs>
        <LinearGradient id="adFade" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={MUTED} stopOpacity="0.55" />
          <Stop offset="1" stopColor={MUTED} stopOpacity="0.2" />
        </LinearGradient>
      </Defs>
      <PhoneFrame>
        <ScreenHeaderLines />
        {/* 消える広告枠 */}
        <Rect
          x={SCREEN.x + 8}
          y={62}
          width={SCREEN.width - 16}
          height={34}
          rx={6}
          fill="url(#adFade)"
        />
        <SvgText
          x={SCREEN.x + SCREEN.width / 2}
          y={84}
          fill="#A1A1AA"
          fontSize={13}
          fontWeight="bold"
          textAnchor="middle"
        >
          広告
        </SvgText>
        {/* 記録が続けられることを示すコンテンツ行 */}
        {[110, 126, 142].map((y, index) => (
          <Rect
            key={y}
            x={SCREEN.x + 8}
            y={y}
            width={index === 1 ? 44 : SCREEN.width - 16}
            height={7}
            rx={3.5}
            fill={BRAND}
            opacity={index === 1 ? 0.5 : 0.28}
          />
        ))}
      </PhoneFrame>
      {/* 禁止記号 */}
      <G>
        <Circle
          cx={196}
          cy={62}
          r={26}
          fill="#2E2E2E"
          stroke={BRAND}
          strokeWidth={3}
        />
        <Line
          x1={178}
          y1={80}
          x2={214}
          y2={44}
          stroke={BRAND}
          strokeWidth={3}
          strokeLinecap="round"
        />
      </G>
      <Sparkle x={62} y={120} size={8} />
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

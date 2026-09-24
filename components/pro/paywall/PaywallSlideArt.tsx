import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, {
  Circle,
  G,
  Line,
  Path,
  Polygon,
  Polyline,
  Rect,
  Text as SvgText,
} from "react-native-svg";

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
export const SLIDE_ART_HEIGHT = 190;

const BRAND = "#d08000";
const CARD_BG = "#27272A";
const CARD_EDGE = "#3F3F46";
const BODY = "#3F3F46";
const MUTED = "#52525B";
const INK = "#F4F4F4";
const SUB_INK = "#A1A1AA";
const GRASS = "#2F6B45";

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

/**
 * 方向別の打率。
 * 構図: 中央に球場のカード、左右に円形の吹き出しを重ねる（みてねの「公開範囲」型）。
 */
export function HitDirectionArt() {
  const home = { x: 140, y: 146 };
  const zones = [
    { cx: 112, cy: 92, r: 15, opacity: 0.95 },
    { cx: 142, cy: 74, r: 12, opacity: 0.5 },
    { cx: 170, cy: 94, r: 13, opacity: 0.7 },
    { cx: 126, cy: 120, r: 9, opacity: 0.3 },
    { cx: 158, cy: 120, r: 9, opacity: 0.45 },
  ];
  return (
    <ArtCanvas>
      <Confetti
        items={[
          { cx: 252, cy: 34, r: 8, fill: "#5B8DEF", opacity: 0.25 },
          { cx: 24, cy: 150, r: 10, fill: "#4F9E6B", opacity: 0.25 },
        ]}
      />
      <Card x={74} y={28} width={132} height={134} />
      {/* 外野のふくらみとファウルライン */}
      <Path
        d={`M ${home.x} ${home.y} L 90 60 A 52 52 0 0 1 190 60 Z`}
        fill={GRASS}
        opacity={0.5}
      />
      <Path
        d={`M ${home.x} ${home.y} m -30 0 a 30 30 0 0 1 60 0 Z`}
        fill="#8A6A44"
        opacity={0.45}
      />
      <Line
        x1={home.x}
        y1={home.y}
        x2={90}
        y2={60}
        stroke={INK}
        strokeWidth={1.2}
        opacity={0.55}
      />
      <Line
        x1={home.x}
        y1={home.y}
        x2={190}
        y2={60}
        stroke={INK}
        strokeWidth={1.2}
        opacity={0.55}
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
      <Circle cx={home.x} cy={home.y} r={3.5} fill={INK} opacity={0.85} />

      {/* 円形の吹き出し。左は引っ張り、右は流しの傾向を示す */}
      <G>
        <Circle
          cx={54}
          cy={62}
          r={34}
          fill={BODY}
          stroke={MUTED}
          strokeWidth={2}
        />
        <SvgText
          x={54}
          y={56}
          fill={INK}
          fontSize={12}
          fontWeight="bold"
          textAnchor="middle"
        >
          引っ張り
        </SvgText>
        <Rect x={36} y={66} width={36} height={6} rx={3} fill={MUTED} />
        <Rect x={36} y={66} width={30} height={6} rx={3} fill={BRAND} />
      </G>
      <G>
        <Circle
          cx={228}
          cy={128}
          r={30}
          fill={BODY}
          stroke={MUTED}
          strokeWidth={2}
        />
        <SvgText
          x={228}
          y={124}
          fill={INK}
          fontSize={12}
          fontWeight="bold"
          textAnchor="middle"
        >
          流し
        </SvgText>
        <Rect x={214} y={132} width={28} height={6} rx={3} fill={MUTED} />
        <Rect x={214} y={132} width={12} height={6} rx={3} fill={BRAND} />
      </G>
      <Sparkle x={210} y={30} size={8} />
    </ArtCanvas>
  );
}

/**
 * カウント別の打率。
 * 構図: 3 枚の縦カードを扇状に並べ、真ん中を大きく前に出す（みてねの「1秒動画」型）。
 */
export function CountSituationArt() {
  const sideBars = [0.5, 0.75, 0.35];
  const centerBars = [0.85, 0.6, 1];
  return (
    <ArtCanvas>
      <Confetti
        items={[
          { cx: 26, cy: 36, r: 9, fill: BRAND, opacity: 0.22 },
          { cx: 256, cy: 158, r: 11, fill: "#5B8DEF", opacity: 0.2 },
        ]}
      />
      {/* 左右のカードは奥に、中央は手前に重ねる */}
      <G transform="rotate(-8 90 106)">
        <Card x={48} y={54} width={72} height={104} opacity={0.75} />
        <SvgText x={84} y={76} fill={SUB_INK} fontSize={11} textAnchor="middle">
          初球
        </SvgText>
        {sideBars.map((ratio, index) => (
          <Rect
            key={index}
            x={60}
            y={90 + index * 16}
            width={48 * ratio}
            height={8}
            rx={4}
            fill={BRAND}
            opacity={0.45}
          />
        ))}
      </G>
      <G transform="rotate(8 190 106)">
        <Card x={160} y={54} width={72} height={104} opacity={0.75} />
        <SvgText
          x={196}
          y={76}
          fill={SUB_INK}
          fontSize={11}
          textAnchor="middle"
        >
          追い込み
        </SvgText>
        {sideBars.map((ratio, index) => (
          <Rect
            key={index}
            x={172}
            y={90 + index * 16}
            width={48 * (1 - ratio * 0.6)}
            height={8}
            rx={4}
            fill={MUTED}
          />
        ))}
      </G>
      <G>
        <Card x={102} y={32} width={76} height={132} fill="#2E2E30" />
        <SvgText
          x={140}
          y={56}
          fill={INK}
          fontSize={12}
          fontWeight="bold"
          textAnchor="middle"
        >
          有利
        </SvgText>
        {centerBars.map((ratio, index) => (
          <Rect
            key={index}
            x={114}
            y={72 + index * 22}
            width={52 * ratio}
            height={12}
            rx={6}
            fill={BRAND}
          />
        ))}
        <Rect x={114} y={140} width={30} height={6} rx={3} fill={MUTED} />
      </G>
      <Sparkle x={236} y={44} size={8} />
      <Sparkle x={40} y={152} size={7} />
    </ArtCanvas>
  );
}

/**
 * コース別の打率。
 * 構図: 傾けたカードを重ね、右下に丸いバッジを添える（みてねの「まとめてダウンロード」型）。
 */
export function PitchCourseArt() {
  const cellSize = 24;
  const gap = 4;
  const originX = 106;
  const originY = 52;
  // 真ん中〜内寄りが得意、外角低めが苦手という分かりやすい濃淡にする。
  const opacities = [0.28, 0.5, 0.2, 0.68, 1, 0.42, 0.36, 0.58, 0.16];
  return (
    <ArtCanvas>
      <Confetti
        items={[
          { cx: 32, cy: 44, r: 10, fill: "#4F9E6B", opacity: 0.22 },
          { cx: 250, cy: 40, r: 7, fill: BRAND, opacity: 0.25 },
        ]}
      />
      <G transform="rotate(-9 140 100)">
        <Card
          x={76}
          y={36}
          width={128}
          height={124}
          fill={BODY}
          opacity={0.55}
        />
      </G>
      <G transform="rotate(4 140 100)">
        <Card x={84} y={34} width={120} height={124} />
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
              rx={5}
              fill={BRAND}
              opacity={opacity}
            />
          );
        })}
        <Rect
          x={originX - 6}
          y={originY - 6}
          width={3 * cellSize + 2 * gap + 12}
          height={3 * cellSize + 2 * gap + 12}
          rx={8}
          fill="none"
          stroke={INK}
          strokeWidth={1.4}
          opacity={0.5}
        />
      </G>
      {/* 狙いを定めるバッジ */}
      <G>
        <Circle cx={208} cy={144} r={22} fill={BRAND} />
        <Circle
          cx={208}
          cy={144}
          r={10}
          fill="none"
          stroke={INK}
          strokeWidth={2.4}
        />
        <Line
          x1={208}
          y1={128}
          x2={208}
          y2={136}
          stroke={INK}
          strokeWidth={2.4}
          strokeLinecap="round"
        />
        <Line
          x1={208}
          y1={152}
          x2={208}
          y2={160}
          stroke={INK}
          strokeWidth={2.4}
          strokeLinecap="round"
        />
        <Line
          x1={192}
          y1={144}
          x2={200}
          y2={144}
          stroke={INK}
          strokeWidth={2.4}
          strokeLinecap="round"
        />
        <Line
          x1={216}
          y1={144}
          x2={224}
          y2={144}
          stroke={INK}
          strokeWidth={2.4}
          strokeLinecap="round"
        />
      </G>
      <Sparkle x={54} y={136} size={8} />
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
      <G>
        <Rect x={10} y={22} width={92} height={150} rx={16} fill={BODY} />
        <Rect x={18} y={34} width={76} height={126} rx={11} fill="#1F1F22" />
        <Rect x={28} y={46} width={38} height={6} rx={3} fill={MUTED} />
        <Rect x={28} y={58} width={24} height={5} rx={2.5} fill={MUTED} />
        {[76, 96, 116, 136].map((y) => (
          <Rect
            key={y}
            x={28}
            y={y}
            width={56}
            height={10}
            rx={5}
            fill={BRAND}
            opacity={0.18}
          />
        ))}
      </G>

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
  const screenX = 100;
  const screenWidth = 80;
  return (
    <ArtCanvas>
      <Confetti
        items={[
          { cx: 30, cy: 56, r: 11, fill: "#4F9E6B", opacity: 0.22 },
          { cx: 42, cy: 150, r: 7, fill: "#5B8DEF", opacity: 0.25 },
        ]}
      />
      <G>
        <Rect x={94} y={10} width={92} height={172} rx={16} fill={BODY} />
        <Rect
          x={screenX}
          y={22}
          width={screenWidth}
          height={148}
          rx={11}
          fill="#1F1F22"
        />
        <Rect
          x={screenX + 12}
          y={34}
          width={36}
          height={6}
          rx={3}
          fill={MUTED}
        />
        {/* 消える広告枠 */}
        <Rect
          x={screenX + 8}
          y={52}
          width={screenWidth - 16}
          height={32}
          rx={6}
          fill={MUTED}
          opacity={0.4}
        />
        <SvgText
          x={screenX + screenWidth / 2}
          y={73}
          fill={SUB_INK}
          fontSize={13}
          fontWeight="bold"
          textAnchor="middle"
        >
          広告
        </SvgText>
        {/* 広告が消えた先に記録が続く */}
        {[98, 116, 134, 152].map((y, index) => (
          <Rect
            key={y}
            x={screenX + 8}
            y={y}
            width={index === 1 ? 40 : screenWidth - 16}
            height={8}
            rx={4}
            fill={BRAND}
            opacity={index === 1 ? 0.55 : 0.26}
          />
        ))}
      </G>
      {/* 禁止記号 */}
      <G>
        <Circle
          cx={196}
          cy={58}
          r={30}
          fill="#2E2E2E"
          stroke={BRAND}
          strokeWidth={3.5}
        />
        <Line
          x1={175}
          y1={79}
          x2={217}
          y2={37}
          stroke={BRAND}
          strokeWidth={3.5}
          strokeLinecap="round"
        />
      </G>
      <Sparkle x={240} y={116} size={10} />
      <Sparkle x={222} y={150} size={7} color="#5B8DEF" />
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

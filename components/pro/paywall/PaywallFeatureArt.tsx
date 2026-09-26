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
  BODY,
  BRAND,
  Card,
  CARD_BG,
  Confetti,
  INK,
  MUTED,
  PHONE,
  PhoneMock,
  Sparkle,
  SUB_INK,
} from "./artPrimitives";

/**
 * 「Pro でできること」の一覧で使う機能イラスト。
 * スライドと同じ作り物のイラストで、ユーザーのデータは一切描かない。
 * スライドを持たない機能（メディア・レポート・目標など）をここで補う。
 */

/** 写真・動画のタイル。中身は描き込まず、枚数と種類だけ伝える。 */
function MediaTile({
  x,
  y,
  size,
  isVideo = false,
}: {
  x: number;
  y: number;
  size: number;
  isVideo?: boolean;
}) {
  return (
    <G>
      <Rect x={x} y={y} width={size} height={size} rx={6} fill={BODY} />
      {/* 山と太陽で写真を表す */}
      <Circle
        cx={x + size * 0.28}
        cy={y + size * 0.3}
        r={size * 0.09}
        fill={SUB_INK}
      />
      <Polygon
        points={`${x + size * 0.12},${y + size * 0.78} ${x + size * 0.42},${y + size * 0.42} ${x + size * 0.72},${y + size * 0.78}`}
        fill={SUB_INK}
        opacity={0.8}
      />
      <Polygon
        points={`${x + size * 0.5},${y + size * 0.78} ${x + size * 0.72},${y + size * 0.54} ${x + size * 0.92},${y + size * 0.78}`}
        fill={SUB_INK}
        opacity={0.55}
      />
      {isVideo ? (
        <G>
          <Circle
            cx={x + size / 2}
            cy={y + size / 2}
            r={size * 0.26}
            fill="#1B1B1E"
            opacity={0.8}
          />
          <Polygon
            points={`${x + size / 2 - size * 0.08},${y + size / 2 - size * 0.13} ${x + size / 2 + size * 0.15},${y + size / 2} ${x + size / 2 - size * 0.08},${y + size / 2 + size * 0.13}`}
            fill={INK}
          />
        </G>
      ) : null}
    </G>
  );
}

/**
 * 野球ノートの動画・画像アップロード。
 * 構図: 端末の画面にメディアのタイルを敷き詰め、右下に追加バッジを重ねる。
 */
export function MediaUploadArt({ height }: ArtProps) {
  const bezel = PHONE.width * 0.045;
  const screenX = PHONE.x + bezel;
  const tile = 62;
  const gapSize = 8;
  const gridX = PHONE.x + (PHONE.width - (tile * 2 + gapSize)) / 2;
  const gridY = 56;
  return (
    <ArtCanvas height={height}>
      <Confetti
        items={[
          { cx: 24, cy: 40, r: 10, fill: "#5B8DEF", opacity: 0.2 },
          { cx: 256, cy: 158, r: 9, fill: BRAND, opacity: 0.2 },
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
        <MediaTile x={gridX} y={gridY} size={tile} />
        <MediaTile x={gridX + tile + gapSize} y={gridY} size={tile} isVideo />
        <MediaTile x={gridX} y={gridY + tile + gapSize} size={tile} isVideo />
        <MediaTile
          x={gridX + tile + gapSize}
          y={gridY + tile + gapSize}
          size={tile}
        />
      </PhoneMock>
      {/* 追加バッジ */}
      <G>
        <Circle cx={216} cy={148} r={22} fill={BRAND} />
        <Line
          x1={216}
          y1={138}
          x2={216}
          y2={158}
          stroke={INK}
          strokeWidth={4}
          strokeLinecap="round"
        />
        <Line
          x1={206}
          y1={148}
          x2={226}
          y2={148}
          stroke={INK}
          strokeWidth={4}
          strokeLinecap="round"
        />
      </G>
      <Sparkle x={40} y={150} size={9} />
    </ArtCanvas>
  );
}

/**
 * 練習と成績のつながり。
 * 構図: 練習量と打率の散布図。右上へ伸びる相関線で「やった分だけ上がる」を示す。
 */
export function CorrelationArt({ height }: ArtProps) {
  const chart = { left: 56, right: 250, top: 30, bottom: 140 };
  const points = [
    { x: 74, y: 128 },
    { x: 104, y: 112 },
    { x: 126, y: 118 },
    { x: 150, y: 92 },
    { x: 178, y: 78 },
    { x: 206, y: 66 },
    { x: 232, y: 48 },
  ];
  return (
    <ArtCanvas height={height}>
      <Confetti
        items={[
          { cx: 24, cy: 26, r: 9, fill: "#4F9E6B", opacity: 0.2 },
          { cx: 262, cy: 164, r: 10, fill: BRAND, opacity: 0.18 },
        ]}
      />
      {/* 軸 */}
      <Line
        x1={chart.left}
        y1={chart.top}
        x2={chart.left}
        y2={chart.bottom}
        stroke={MUTED}
        strokeWidth={2}
      />
      <Line
        x1={chart.left}
        y1={chart.bottom}
        x2={chart.right}
        y2={chart.bottom}
        stroke={MUTED}
        strokeWidth={2}
      />
      <SvgText x={44} y={38} fill={SUB_INK} fontSize={10} textAnchor="end">
        打率
      </SvgText>
      <SvgText
        x={chart.right}
        y={162}
        fill={SUB_INK}
        fontSize={10}
        textAnchor="end"
      >
        練習量
      </SvgText>
      {/* 相関の目安線 */}
      <Line
        x1={68}
        y1={132}
        x2={240}
        y2={44}
        stroke={BRAND}
        strokeWidth={3}
        strokeDasharray="7 5"
        strokeLinecap="round"
        opacity={0.8}
      />
      {points.map((point) => (
        <Circle
          key={`${point.x}-${point.y}`}
          cx={point.x}
          cy={point.y}
          r={7}
          fill={BRAND}
          opacity={0.9}
        />
      ))}
      <Sparkle x={244} y={26} size={9} />
    </ArtCanvas>
  );
}

/**
 * 週次・月次の振り返りレポート。
 * 構図: レポートのカードに一週間のバーと増減の要約を並べる。
 */
export function PeriodicReviewArt({ height }: ArtProps) {
  const bars = [0.4, 0.7, 0.55, 0.9, 0.45, 0.8, 0.65];
  return (
    <ArtCanvas height={height}>
      <Confetti
        items={[
          { cx: 20, cy: 36, r: 9, fill: BRAND, opacity: 0.2 },
          { cx: 262, cy: 156, r: 10, fill: "#5B8DEF", opacity: 0.18 },
        ]}
      />
      <Card x={26} y={16} width={228} height={158} fill={CARD_BG} />
      <SvgText x={44} y={44} fill={INK} fontSize={14} fontWeight="bold">
        今週のまとめ
      </SvgText>
      {/* 一週間の練習量 */}
      {bars.map((ratio, index) => {
        const x = 44 + index * 27;
        const barHeight = 46 * ratio;
        return (
          <G key={x}>
            <Rect
              x={x}
              y={110 - 46}
              width={17}
              height={46}
              rx={4}
              fill={BODY}
              opacity={0.6}
            />
            <Rect
              x={x}
              y={110 - barHeight}
              width={17}
              height={barHeight}
              rx={4}
              fill={BRAND}
              opacity={index === 3 ? 1 : 0.6}
            />
          </G>
        );
      })}
      <Line
        x1={44}
        y1={110}
        x2={236}
        y2={110}
        stroke={MUTED}
        strokeWidth={1.5}
      />
      {/* 増減の要約 */}
      <G>
        <Polygon points="48,146 54,134 60,146" fill="#4f9e6b" />
        <SvgText x={68} y={146} fill={INK} fontSize={12} fontWeight="bold">
          打率 .312
        </SvgText>
        <SvgText x={148} y={146} fill={SUB_INK} fontSize={10}>
          前週比 +.028
        </SvgText>
      </G>
      <Sparkle x={244} y={30} size={8} />
    </ArtCanvas>
  );
}

/**
 * 目標管理。
 * 構図: 進捗リングで達成度を示し、横に目標の内容を置く。
 */
export function GoalArt({ height }: ArtProps) {
  const cx = 82;
  const cy = 96;
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const progress = 0.72;
  return (
    <ArtCanvas height={height}>
      <Confetti
        items={[
          { cx: 252, cy: 34, r: 9, fill: "#4F9E6B", opacity: 0.2 },
          { cx: 26, cy: 170, r: 9, fill: "#5B8DEF", opacity: 0.2 },
        ]}
      />
      {/* 進捗リング */}
      <Circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke={BODY}
        strokeWidth={14}
      />
      <Circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke={BRAND}
        strokeWidth={14}
        strokeLinecap="round"
        strokeDasharray={`${circumference * progress} ${circumference}`}
        transform={`rotate(-90 ${cx} ${cy})`}
      />
      <SvgText
        x={cx}
        y={cy + 9}
        fill={INK}
        fontSize={26}
        fontWeight="bold"
        textAnchor="middle"
      >
        72%
      </SvgText>
      {/* 目標の内容 */}
      <Card x={152} y={52} width={110} height={88} fill={CARD_BG} />
      <SvgText x={166} y={78} fill={SUB_INK} fontSize={10}>
        今シーズン目標
      </SvgText>
      <SvgText x={166} y={104} fill={INK} fontSize={20} fontWeight="bold">
        打率 .320
      </SvgText>
      <Rect x={166} y={116} width={82} height={8} rx={4} fill={BODY} />
      <Rect x={166} y={116} width={59} height={8} rx={4} fill={BRAND} />
      <Sparkle x={140} y={40} size={9} />
    </ArtCanvas>
  );
}

/**
 * 課題管理。
 * 構図: 取り組み中の課題をチェックリストで並べ、達成済みに印を付ける。
 */
export function ImprovementThemeArt({ height }: ArtProps) {
  const rows = [
    { y: 30, done: true, width: 120 },
    { y: 76, done: true, width: 96 },
    { y: 122, done: false, width: 134 },
  ];
  return (
    <ArtCanvas height={height}>
      <Confetti
        items={[
          { cx: 256, cy: 28, r: 9, fill: BRAND, opacity: 0.2 },
          { cx: 22, cy: 166, r: 10, fill: "#4F9E6B", opacity: 0.18 },
        ]}
      />
      {rows.map((row) => (
        <G key={row.y}>
          <Card x={26} y={row.y} width={228} height={38} fill={CARD_BG} />
          {row.done ? (
            <G>
              <Circle cx={52} cy={row.y + 19} r={13} fill={BRAND} />
              <Polyline
                points={`45,${row.y + 19} 50,${row.y + 25} 60,${row.y + 13}`}
                fill="none"
                stroke={INK}
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </G>
          ) : (
            <Circle
              cx={52}
              cy={row.y + 19}
              r={13}
              fill="none"
              stroke={MUTED}
              strokeWidth={3}
            />
          )}
          <Rect
            x={76}
            y={row.y + 11}
            width={row.width}
            height={8}
            rx={4}
            fill={row.done ? MUTED : INK}
            opacity={row.done ? 0.7 : 0.85}
          />
          <Rect
            x={76}
            y={row.y + 24}
            width={row.width * 0.55}
            height={6}
            rx={3}
            fill={MUTED}
            opacity={0.6}
          />
        </G>
      ))}
      <Sparkle x={244} y={150} size={9} />
    </ArtCanvas>
  );
}

/**
 * グループ。
 * 構図: 順位付きの一覧で、チームや仲間と成績を並べて比べられることを示す。
 */
export function GroupArt({ height }: ArtProps) {
  const rows = [
    { y: 26, rank: 1, color: BRAND, barWidth: 118 },
    { y: 74, rank: 2, color: "#A1A1AA", barWidth: 96 },
    { y: 122, rank: 3, color: "#b07840", barWidth: 74 },
  ];
  return (
    <ArtCanvas height={height}>
      <Confetti
        items={[
          { cx: 20, cy: 32, r: 9, fill: "#5B8DEF", opacity: 0.2 },
          { cx: 258, cy: 164, r: 10, fill: BRAND, opacity: 0.18 },
        ]}
      />
      {rows.map((row) => (
        <G key={row.y}>
          <Card
            x={24}
            y={row.y}
            width={232}
            height={40}
            fill={row.rank === 1 ? "rgba(208, 128, 0, 0.14)" : CARD_BG}
          />
          {/* 順位 */}
          <Circle cx={48} cy={row.y + 20} r={14} fill={row.color} />
          <SvgText
            x={48}
            y={row.y + 25}
            fill="#1B1B1E"
            fontSize={14}
            fontWeight="bold"
            textAnchor="middle"
          >
            {String(row.rank)}
          </SvgText>
          {/* 人アイコン */}
          <Circle cx={82} cy={row.y + 20} r={13} fill={BODY} />
          <Circle cx={82} cy={row.y + 16} r={4.6} fill={SUB_INK} />
          <Path d={`M 74,${row.y + 28} a 8,8 0 0 1 16,0 Z`} fill={SUB_INK} />
          <Rect
            x={104}
            y={row.y + 16}
            width={row.barWidth}
            height={9}
            rx={4.5}
            fill={row.rank === 1 ? BRAND : MUTED}
            opacity={row.rank === 1 ? 1 : 0.7}
          />
        </G>
      ))}
      <Sparkle x={242} y={34} size={9} />
    </ArtCanvas>
  );
}

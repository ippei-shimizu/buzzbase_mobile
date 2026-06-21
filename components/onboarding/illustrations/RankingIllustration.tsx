import React from "react";
import Svg, { Rect, Circle, Path, G, Text as SvgText } from "react-native-svg";

interface Props {
  size?: number;
}

/**
 * 「チームメイトとランキングで競う」を表すイラスト。順位バーと先頭の王冠を描く。
 * 画像素材確定後に差し替え可能な仮ビジュアル。
 */
export const RankingIllustration = ({ size = 200 }: Props) => {
  const rows = [
    { rank: 1, width: 120, fill: "#d08000", textFill: "#2E2E2E" },
    { rank: 2, width: 96, fill: "#424242", textFill: "#F4F4F4" },
    { rank: 3, width: 72, fill: "#424242", textFill: "#F4F4F4" },
  ];

  return (
    <Svg width={size} height={size} viewBox="0 0 200 200" fill="none">
      <Path
        d="M84 28 L92 42 L100 26 L108 42 L116 28 L113 54 L87 54 Z"
        fill="#d08000"
      />
      {rows.map((row, index) => {
        const y = 70 + index * 36;
        return (
          <G key={row.rank}>
            <Circle
              cx="34"
              cy={y + 11}
              r="13"
              fill="#27272a"
              stroke="#424242"
              strokeWidth="2"
            />
            <SvgText
              x="34"
              y={y + 15}
              fill="#F4F4F4"
              fontSize="13"
              fontWeight="bold"
              textAnchor="middle"
            >
              {row.rank}
            </SvgText>
            <Rect
              x="54"
              y={y}
              width={row.width}
              height="22"
              rx="11"
              fill={row.fill}
            />
            <SvgText
              x={54 + row.width - 12}
              y={y + 16}
              fill={row.textFill}
              fontSize="12"
              fontWeight="bold"
              textAnchor="end"
            >
              {(0.38 - index * 0.02).toFixed(3).replace(/^0/, "")}
            </SvgText>
          </G>
        );
      })}
    </Svg>
  );
};

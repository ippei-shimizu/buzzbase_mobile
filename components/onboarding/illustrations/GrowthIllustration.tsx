import React from "react";
import Svg, { Line, Polyline, Circle, Path } from "react-native-svg";

interface Props {
  size?: number;
}

/**
 * 「成長を1枚のグラフで」を表すイラスト。上昇する成績推移の折れ線グラフを描く。
 * 画像素材確定後に差し替え可能な仮ビジュアル。
 */
export const GrowthIllustration = ({ size = 200 }: Props) => {
  const points = "40,150 72,128 104,138 136,96 168,58";

  return (
    <Svg width={size} height={size} viewBox="0 0 200 200" fill="none">
      <Line x1="36" y1="34" x2="36" y2="166" stroke="#424242" strokeWidth="2" />
      <Line
        x1="36"
        y1="166"
        x2="176"
        y2="166"
        stroke="#424242"
        strokeWidth="2"
      />
      {[60, 100, 140].map((y) => (
        <Line
          key={y}
          x1="36"
          y1={y}
          x2="176"
          y2={y}
          stroke="#27272a"
          strokeWidth="1"
        />
      ))}
      <Path
        d="M40 150 L72 128 L104 138 L136 96 L168 58 L168 166 L40 166 Z"
        fill="#d08000"
        fillOpacity="0.15"
      />
      <Polyline
        points={points}
        fill="none"
        stroke="#d08000"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {points.split(" ").map((point) => {
        const [x, y] = point.split(",");
        return <Circle key={point} cx={x} cy={y} r="5" fill="#d08000" />;
      })}
    </Svg>
  );
};

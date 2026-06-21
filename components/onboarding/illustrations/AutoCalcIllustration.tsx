import React from "react";
import Svg, { Rect, Circle, Path, G, Text as SvgText } from "react-native-svg";

interface Props {
  size?: number;
}

/**
 * 「打席入力 → 自動計算」を表すイラスト。電卓本体と、算出された主要指標バッジを描く。
 * 画像素材確定後に差し替え可能な仮ビジュアル。
 */
export const AutoCalcIllustration = ({ size = 200 }: Props) => (
  <Svg width={size} height={size} viewBox="0 0 200 200" fill="none">
    <Rect x="34" y="22" width="92" height="156" rx="14" fill="#27272a" />
    <Rect
      x="34"
      y="22"
      width="92"
      height="156"
      rx="14"
      stroke="#424242"
      strokeWidth="2"
    />
    <Rect x="46" y="36" width="68" height="30" rx="6" fill="#1f1f22" />
    <SvgText
      x="108"
      y="58"
      fill="#d08000"
      fontSize="18"
      fontWeight="bold"
      textAnchor="end"
    >
      .333
    </SvgText>
    {[0, 1, 2].map((row) =>
      [0, 1, 2].map((col) => (
        <Rect
          key={`${row}-${col}`}
          x={46 + col * 24}
          y={80 + row * 24}
          width="18"
          height="18"
          rx="5"
          fill="#424242"
        />
      )),
    )}
    <G>
      <Circle cx="150" cy="70" r="22" fill="#d08000" />
      <SvgText
        x="150"
        y="66"
        fill="#2E2E2E"
        fontSize="11"
        fontWeight="bold"
        textAnchor="middle"
      >
        OPS
      </SvgText>
      <SvgText
        x="150"
        y="80"
        fill="#2E2E2E"
        fontSize="12"
        fontWeight="bold"
        textAnchor="middle"
      >
        .900
      </SvgText>
    </G>
    <G>
      <Circle
        cx="158"
        cy="128"
        r="20"
        fill="#27272a"
        stroke="#d08000"
        strokeWidth="2"
      />
      <SvgText x="158" y="124" fill="#A1A1AA" fontSize="9" textAnchor="middle">
        防御率
      </SvgText>
      <SvgText
        x="158"
        y="138"
        fill="#F4F4F4"
        fontSize="12"
        fontWeight="bold"
        textAnchor="middle"
      >
        2.50
      </SvgText>
    </G>
    <Path
      d="M128 96 L142 84"
      stroke="#d08000"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </Svg>
);

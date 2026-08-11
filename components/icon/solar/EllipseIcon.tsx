// このファイルは scripts/icons/generate-solar-icons.mjs が生成する。直接編集しない。
// 出典: Solar Icons (record-bold) by 480 Design / CC BY 4.0
import type { StyleProp, ViewStyle } from "react-native";
import React from "react";
import Svg, { Circle } from "react-native-svg";

interface IconProps {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export const EllipseIcon = ({
  size = 24,
  color = "#F4F4F4",
  style,
}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Circle cx={12} cy={12} r={10} fill={color} />
  </Svg>
);

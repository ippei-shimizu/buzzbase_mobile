// このファイルは scripts/icons/generate-solar-icons.mjs が生成する。直接編集しない。
// 出典: Solar Icons (scissors-linear) by 480 Design / CC BY 4.0
import React from "react";
import type { StyleProp, ViewStyle } from "react-native";
import Svg, { Path } from "react-native-svg";

interface IconProps {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export const CutOutlineIcon = ({
  size = 24,
  color = "#F4F4F4",
  style,
}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path
      fill="none"
      stroke={color}
      strokeLinecap="round"
      strokeWidth={1.5}
      d="M16.401 20.5L6 2m16 17a3 3 0 1 1-6 0a3 3 0 0 1 6 0ZM7.599 20.5L18 2M2 19a3 3 0 1 0 6 0a3 3 0 0 0-6 0Z"
    />
  </Svg>
);

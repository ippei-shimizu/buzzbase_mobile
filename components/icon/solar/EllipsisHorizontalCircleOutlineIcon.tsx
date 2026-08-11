// このファイルは scripts/icons/generate-solar-icons.mjs が生成する。直接編集しない。
// 出典: Solar Icons (menu-dots-circle-linear) by 480 Design / CC BY 4.0
import type { StyleProp, ViewStyle } from "react-native";
import React from "react";
import Svg, { Circle, G, Path } from "react-native-svg";

interface IconProps {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export const EllipsisHorizontalCircleOutlineIcon = ({
  size = 24,
  color = "#F4F4F4",
  style,
}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <G fill="none" stroke={color} strokeWidth={1.5}>
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 12h.009m3.996 0h.008m3.978 0H16"
      />
      <Circle cx={12} cy={12} r={10} />
    </G>
  </Svg>
);

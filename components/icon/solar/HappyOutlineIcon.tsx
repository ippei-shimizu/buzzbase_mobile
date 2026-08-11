// このファイルは scripts/icons/generate-solar-icons.mjs が生成する。直接編集しない。
// 出典: Solar Icons (smile-circle-linear) by 480 Design / CC BY 4.0
import React from "react";
import type { StyleProp, ViewStyle } from "react-native";
import Svg, { Circle, Ellipse, G, Path } from "react-native-svg";

interface IconProps {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export const HappyOutlineIcon = ({
  size = 24,
  color = "#F4F4F4",
  style,
}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <G fill="none" stroke={color}>
      <Circle cx={12} cy={12} r={10} strokeWidth={1.5} />
      <Path
        strokeLinecap="round"
        strokeWidth={1.5}
        d="M9 16c.85.63 1.885 1 3 1s2.15-.37 3-1"
      />
      <Path d="M15.5 10.5c0 .552-.224 1-.5 1s-.5-.448-.5-1s.224-1 .5-1s.5.448.5 1Z" />
      <Ellipse cx={9} cy={10.5} rx={0.5} ry={1} />
    </G>
  </Svg>
);

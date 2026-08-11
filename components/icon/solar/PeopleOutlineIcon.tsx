// このファイルは scripts/icons/generate-solar-icons.mjs が生成する。直接編集しない。
// 出典: Solar Icons (users-group-rounded-linear) by 480 Design / CC BY 4.0
import React from "react";
import type { StyleProp, ViewStyle } from "react-native";
import Svg, { Circle, Ellipse, G, Path } from "react-native-svg";

interface IconProps {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export const PeopleOutlineIcon = ({
  size = 24,
  color = "#F4F4F4",
  style,
}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <G fill="none" stroke={color} strokeWidth={1.5}>
      <Circle cx={9} cy={6} r={4} />
      <Path strokeLinecap="round" d="M15 9a3 3 0 1 0 0-6" />
      <Ellipse cx={9} cy={17} rx={7} ry={4} />
      <Path
        strokeLinecap="round"
        d="M18 14c1.754.385 3 1.359 3 2.5c0 1.03-1.014 1.923-2.5 2.37"
      />
    </G>
  </Svg>
);

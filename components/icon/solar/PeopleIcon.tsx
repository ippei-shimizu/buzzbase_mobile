// このファイルは scripts/icons/generate-solar-icons.mjs が生成する。直接編集しない。
// 出典: Solar Icons (users-group-rounded-bold-duotone) by 480 Design / CC BY 4.0
import React from "react";
import type { StyleProp, ViewStyle } from "react-native";
import Svg, { Circle, Ellipse, G } from "react-native-svg";

interface IconProps {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export const PeopleIcon = ({
  size = 24,
  color = "#F4F4F4",
  style,
}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <G fill={color}>
      <Circle cx={15} cy={6} r={3} opacity={0.5} />
      <Ellipse cx={16} cy={17} opacity={0.5} rx={5} ry={3} />
      <Circle cx={9.001} cy={6} r={4} />
      <Ellipse cx={9.001} cy={17.001} rx={7} ry={4} />
    </G>
  </Svg>
);

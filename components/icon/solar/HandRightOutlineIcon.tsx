// このファイルは scripts/icons/generate-solar-icons.mjs が生成する。直接編集しない。
// 出典: Solar Icons (target-linear) by 480 Design / CC BY 4.0
import type { StyleProp, ViewStyle } from "react-native";
import React from "react";
import Svg, { G, Path } from "react-native-svg";

interface IconProps {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export const HandRightOutlineIcon = ({
  size = 24,
  color = "#F4F4F4",
  style,
}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <G fill="none" stroke={color} strokeWidth={1.5}>
      <Path d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2s10 4.477 10 10Z" />
      <Path strokeLinecap="round" d="M2 12h3m14 0h3M12 22v-3m0-14V2" />
      <Path strokeLinecap="round" strokeLinejoin="round" d="M10 12h4m-2 2v-4" />
    </G>
  </Svg>
);

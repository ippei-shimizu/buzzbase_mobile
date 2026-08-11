// このファイルは scripts/icons/generate-solar-icons.mjs が生成する。直接編集しない。
// 出典: Solar Icons (shield-check-linear) by 480 Design / CC BY 4.0
import type { StyleProp, ViewStyle } from "react-native";
import React from "react";
import Svg, { G, Path } from "react-native-svg";

interface IconProps {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export const ShieldHalfOutlineIcon = ({
  size = 24,
  color = "#F4F4F4",
  style,
}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <G fill="none" stroke={color} strokeWidth={1.5}>
      <Path d="M3 10.417c0-3.198 0-4.797.378-5.335c.377-.537 1.88-1.052 4.887-2.081l.573-.196C10.405 2.268 11.188 2 12 2s1.595.268 3.162.805l.573.196c3.007 1.029 4.51 1.544 4.887 2.081C21 5.62 21 7.22 21 10.417v1.574c0 5.638-4.239 8.375-6.899 9.536C13.38 21.842 13.02 22 12 22s-1.38-.158-2.101-.473C7.239 20.365 3 17.63 3 11.991z" />
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m9.5 12.4l1.429 1.6l3.571-4"
      />
    </G>
  </Svg>
);

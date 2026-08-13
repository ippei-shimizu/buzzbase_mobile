// このファイルは scripts/icons/generate-solar-icons.mjs が生成する。直接編集しない。
// 出典: Solar Icons (danger-circle-bold) by 480 Design / CC BY 4.0
import type { StyleProp, ViewStyle } from "react-native";
import React from "react";
import Svg, { Path } from "react-native-svg";

interface IconProps {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export const AlertCircleIcon = ({
  size = 24,
  color = "#F4F4F4",
  style,
}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path
      fill={color}
      fillRule="evenodd"
      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12s4.477 10 10 10s10-4.477 10-10M12 6.25a.75.75 0 0 1 .75.75v6a.75.75 0 0 1-1.5 0V7a.75.75 0 0 1 .75-.75M12 17a1 1 0 1 0 0-2a1 1 0 0 0 0 2"
      clipRule="evenodd"
    />
  </Svg>
);

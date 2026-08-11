// このファイルは scripts/icons/generate-solar-icons.mjs が生成する。直接編集しない。
// 出典: Solar Icons (dumbbell-linear) by 480 Design / CC BY 4.0
import React from "react";
import type { StyleProp, ViewStyle } from "react-native";
import Svg, { Path } from "react-native-svg";

interface IconProps {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export const BarbellOutlineIcon = ({
  size = 24,
  color = "#F4F4F4",
  style,
}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path
      fill="none"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M7.848 15.765C8 15.398 8 14.432 8 13.5h8c0 .932 0 1.898.152 2.265a2 2 0 0 0 1.083 1.083C17.602 17 18.068 17 19 17s1.398 0 1.765-.152a2 2 0 0 0 1.083-1.083C22 15.398 22 14.932 22 14v-4c0-.932 0-1.398-.152-1.765a2 2 0 0 0-1.083-1.083C20.398 7 19.932 7 19 7s-1.398 0-1.765.152a2 2 0 0 0-1.083 1.083C16 8.602 16 9.568 16 10.5H8v0c0-.932 0-1.898-.152-2.265a2 2 0 0 0-1.083-1.083C6.398 7 5.932 7 5 7s-1.398 0-1.765.152a2 2 0 0 0-1.083 1.083C2 8.602 2 9.068 2 10v4c0 .932 0 1.398.152 1.765a2 2 0 0 0 1.083 1.083C3.602 17 4.068 17 5 17s1.398 0 1.765-.152a2 2 0 0 0 1.083-1.083"
    />
  </Svg>
);

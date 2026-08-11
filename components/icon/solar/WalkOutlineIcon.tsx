// このファイルは scripts/icons/generate-solar-icons.mjs が生成する。直接編集しない。
// 出典: Solar Icons (walking-linear) by 480 Design / CC BY 4.0
import React from "react";
import type { StyleProp, ViewStyle } from "react-native";
import Svg, { Circle, G, Path } from "react-native-svg";

interface IconProps {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export const WalkOutlineIcon = ({
  size = 24,
  color = "#F4F4F4",
  style,
}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <G fill="none" stroke={color} strokeWidth={1.5}>
      <Circle cx={11.5} cy={4.5} r={2.5} />
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m10.5 10l-.159 1.587c-.169 1.69-.253 2.536-.063 3.348c.191.811.643 1.53 1.547 2.969L14.4 22m-3.9-12h-.291c-1.539 0-2.308 0-2.856.44c-.549.44-.715 1.19-1.05 2.692L6 14.5m4.5-4.5h1.77c.16 0 .24 0 .312.005a2 2 0 0 1 1.757 1.372c.022.068.042.146.08.301c.053.209.079.313.108.397a2 2 0 0 0 2.35 1.29c.088-.02.19-.054.393-.122L18 13"
      />
      <Path strokeLinecap="round" d="M9 17.5L6 22" />
    </G>
  </Svg>
);

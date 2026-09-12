import type { StyleProp, ViewStyle } from "react-native";
import React from "react";
import Svg, { Path } from "react-native-svg";

interface IconProps {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

/** Solar Icons には枠なしの素の − が無いため、Solar Linear と同じ線幅で自作している。 */
export const MinusIcon = ({
  size = 24,
  color = "#F4F4F4",
  style,
}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path d="M5 12h14" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
  </Svg>
);

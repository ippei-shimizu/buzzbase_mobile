import type { StyleProp, ViewStyle } from "react-native";
import React from "react";
import Svg, { Path } from "react-native-svg";

interface IconProps {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

/** Solar Icons には枠なしの素の ✕ が無いため、Solar Linear と同じ線幅で自作している。 */
export const CloseIcon = ({
  size = 24,
  color = "#F4F4F4",
  style,
}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path
      d="M6 6l12 12M18 6L6 18"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
  </Svg>
);

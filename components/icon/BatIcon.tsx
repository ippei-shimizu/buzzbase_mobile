import type { StyleProp, ViewStyle } from "react-native";
import React from "react";
import Svg, { Path } from "react-native-svg";

interface IconProps {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export const BatIcon = ({ size = 16, color = "#A1A1AA", style }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path
      d="M6.12 19.82L6.53 18.99L6.95 18.16L7.58 17.54L8.20 16.92L8.82 16.30L9.45 15.67L10.07 15.05L10.70 14.43L11.37 13.86L12.07 13.32L12.80 12.80L13.55 12.31L14.32 11.82L15.08 11.34L15.83 10.85L16.57 10.34L17.28 9.80L17.95 9.23L18.59 8.62L19.21 8.00L19.83 7.38L20.46 6.76L20.93 6.04L21.10 5.20L20.93 4.36L20.46 3.64L19.74 3.17L18.90 3.00L18.06 3.17L17.34 3.64L16.72 4.27L16.10 4.89L15.48 5.51L14.87 6.15L14.30 6.82L13.76 7.53L13.25 8.27L12.76 9.02L12.28 9.78L11.79 10.55L11.30 11.30L10.78 12.03L10.24 12.73L9.67 13.40L9.05 14.03L8.43 14.65L7.80 15.28L7.18 15.90L6.56 16.52L5.94 17.15L5.11 17.57L4.28 17.98L4.00 18.40L3.90 18.90L4.00 19.40L4.28 19.82L4.70 20.10L5.20 20.20L5.70 20.10Z"
      stroke={color}
      strokeWidth={1.5}
      strokeLinejoin="round"
    />
  </Svg>
);

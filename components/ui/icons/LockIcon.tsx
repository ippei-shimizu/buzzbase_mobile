import React from "react";
import { View } from "react-native";
import Svg, { Path } from "react-native-svg";

interface LockIconProps {
  width?: number;
  height?: number;
  fill?: string;
}

export const LockIcon = ({
  width = 14,
  height = 14,
  fill = "#A1A1AA",
}: LockIconProps) => {
  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
        <Path
          d="M6 10V8C6 4.69 7 2 12 2C17 2 18 4.69 18 8V10"
          stroke={fill}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M17 22H7C3 22 2 21 2 17V15C2 11 3 10 7 10H17C21 10 22 11 22 15V17C22 21 21 22 17 22Z"
          stroke={fill}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M15.9965 16H16.0054M11.9955 16H12.0045M7.99451 16H8.00349"
          stroke={fill}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
};

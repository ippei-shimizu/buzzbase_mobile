import React, { useId } from "react";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";

interface IconProps {
  size?: number;
}

export const GroupDefaultIcon = ({ size = 48 }: IconProps) => {
  const id = useId();
  const gradId = `groupGrad-${id}`;

  return (
    <Svg width={size} height={size} viewBox="0 0 74 74" fill="none">
      <Defs>
        <LinearGradient
          id={gradId}
          x1={13}
          y1={64}
          x2={64.5}
          y2={10.5}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#E08E0A" />
          <Stop offset={1} stopColor="#FFBC51" />
        </LinearGradient>
      </Defs>
      <Circle cx={37} cy={37} r={37} fill={`url(#${gradId})`} />
    </Svg>
  );
};

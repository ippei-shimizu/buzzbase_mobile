import type { IconName } from "../../types/icon";
import type { StyleProp, ViewStyle } from "react-native";
import React from "react";
import { SOLAR_ICONS } from "./solar/registry";

interface Props {
  name: IconName;
  size?: number;
  color?: string;
  /** アイコン単体の余白・位置調整用。react-native-svg の Svg にそのまま渡す。 */
  style?: StyleProp<ViewStyle>;
}

/**
 * アプリ全体で使うアイコン。name から Solar Icons 由来の SVG コンポーネントを引く。
 * 線の太さ（Linear / Bold Duotone）は name ごとに scripts/icons/solar-icon-map.mjs で
 * 決まるため props では受け取らない。
 */
export const Icon = React.memo(function Icon({
  name,
  size = 24,
  color = "#F4F4F4",
  style,
}: Props) {
  const IconComponent = SOLAR_ICONS[name];
  return <IconComponent size={size} color={color} style={style} />;
});

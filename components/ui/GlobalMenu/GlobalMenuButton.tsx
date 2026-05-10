import React from "react";
import { TouchableOpacity, type TouchableOpacityProps } from "react-native";
import { MenuIcon } from "@components/icon/MenuIcon";

interface Props extends Omit<TouchableOpacityProps, "children"> {
  size?: number;
  color?: string;
}

/**
 * 各画面のヘッダー右上に配置するハンバーガーアイコンのトリガーボタン。
 * `accessibilityLabel="メニュー"` を必ず付与し、テストやスクリーンリーダーから
 * `getByLabelText("メニュー")` で参照できるようにする。
 */
export const GlobalMenuButton = ({
  size = 24,
  color = "#F4F4F4",
  ...props
}: Props) => (
  <TouchableOpacity
    accessibilityLabel="メニュー"
    accessibilityRole="button"
    hitSlop={8}
    {...props}
  >
    <MenuIcon size={size} color={color} />
  </TouchableOpacity>
);

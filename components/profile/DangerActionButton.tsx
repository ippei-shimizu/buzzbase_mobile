import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  type TouchableOpacityProps,
} from "react-native";

interface Props extends Omit<TouchableOpacityProps, "children"> {
  label: string;
  variant?: "filled" | "outline";
}

/**
 * 設定画面の最下部に配置する破壊的操作ボタン（ログアウト/アカウント削除）。
 *
 * @param label   ボタンに表示するテキスト
 * @param variant `filled` (塗り赤) | `outline` (赤枠透明)。省略時は `filled`
 *
 * フルワイドの大きな角丸ボタン。色は `#EF4444` 系の赤で統一し、
 * 通常のリスト型 `SettingsItem` とは見た目を明確に分ける。
 */
export const DangerActionButton = ({
  label,
  variant = "filled",
  style,
  ...props
}: Props) => {
  const isOutline = variant === "outline";
  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.8}
      style={[styles.base, isOutline ? styles.outline : styles.filled, style]}
      {...props}
    >
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  filled: {
    backgroundColor: "#3A0000",
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  label: {
    color: "#EF4444",
    fontSize: 16,
    fontWeight: "600",
  },
});

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, StyleSheet } from "react-native";

interface FilterResetButtonProps {
  visible: boolean;
  onPress: () => void;
}

/**
 * フィルタードロップダウン行に並べる「クリア」ボタン。
 * 何らかのフィルタが適用されているときだけ呼び出し側が visible=true を渡し、
 * 何も適用されていないときは null を返してレイアウトに残らないようにする。
 */
export const FilterResetButton = ({
  visible,
  onPress,
}: FilterResetButtonProps) => {
  if (!visible) return null;

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="フィルターをクリア"
    >
      <Ionicons name="refresh" size={14} color="#A1A1AA" />
      <Text style={styles.label}>クリア</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  label: {
    color: "#A1A1AA",
    fontSize: 12,
    fontWeight: "500",
  },
});

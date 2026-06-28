import type { PracticeMenu } from "../../types/practice";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View, StyleSheet } from "react-native";

interface Props {
  menu: PracticeMenu;
  onPress: () => void;
}

/** 練習メニュー一覧の1行。既定値があれば「素振り 200本」のように表示する。 */
export function MenuCard({ menu, onPress }: Props) {
  const valueLabel =
    menu.default_value != null
      ? ` ${menu.default_value}${menu.unit_label ?? ""}`
      : "";

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.left}>
        {menu.is_favorite ? (
          <Ionicons name="star" size={14} color="#d08000" />
        ) : null}
        <Text style={styles.name}>
          {menu.name}
          <Text style={styles.value}>{valueLabel}</Text>
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#A1A1AA" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#3A3A3A",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  name: {
    color: "#F4F4F4",
    fontSize: 15,
    fontWeight: "600",
  },
  value: {
    color: "#A1A1AA",
    fontWeight: "400",
  },
});

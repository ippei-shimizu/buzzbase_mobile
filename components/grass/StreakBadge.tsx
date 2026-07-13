import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface Props {
  current: number;
  longest: number;
}

/** Streak（連続日数）バッジ。 */
export function StreakBadge({ current, longest }: Props) {
  return (
    <View style={styles.row}>
      <Ionicons name="flame" size={20} color="#d08000" />
      <Text style={styles.current}>連続 {current}日</Text>
      <Text style={styles.longest}>最長 {longest}日</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  current: { color: "#F4F4F4", fontSize: 18, fontWeight: "800" },
  longest: { color: "#A1A1AA", fontSize: 13 },
});

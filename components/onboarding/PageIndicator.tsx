import React from "react";
import { View, StyleSheet } from "react-native";

interface Props {
  count: number;
  activeIndex: number;
}

export const PageIndicator = ({ count, activeIndex }: Props) => (
  <View
    style={styles.container}
    accessibilityRole="progressbar"
    accessibilityValue={{ min: 1, max: count, now: activeIndex + 1 }}
  >
    {Array.from({ length: count }).map((_, index) => (
      <View
        key={index}
        style={[styles.dot, index === activeIndex && styles.activeDot]}
      />
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#424242",
  },
  activeDot: {
    width: 22,
    backgroundColor: "#d08000",
  },
});

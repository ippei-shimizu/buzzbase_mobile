import React from "react";
import { View, Text, StyleSheet, type ViewStyle } from "react-native";

interface EmptyStateProps {
  title: string;
  subtitle?: string;
  style?: ViewStyle;
}

export const EmptyState = ({ title, subtitle, style }: EmptyStateProps) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: "#424242",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "#A1A1AA",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  subtitle: {
    color: "#71717A",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },
});

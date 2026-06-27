import React from "react";
import { View, Text, StyleSheet, type ViewStyle } from "react-native";
import { Button } from "@components/ui/Button";

interface EmptyStateProps {
  title: string;
  subtitle?: string;
  style?: ViewStyle;
  action?: { label: string; onPress: () => void };
}

export const EmptyState = ({
  title,
  subtitle,
  style,
  action,
}: EmptyStateProps) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {action && (
        <Button
          title={action.label}
          onPress={action.onPress}
          style={styles.action}
        />
      )}
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
  action: {
    marginTop: 16,
    alignSelf: "stretch",
  },
});

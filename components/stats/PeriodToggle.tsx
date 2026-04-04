import type { StatsPeriod } from "../../types/stats";
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface PeriodToggleProps {
  value: StatsPeriod;
  onChange: (period: StatsPeriod) => void;
}

const OPTIONS: { value: StatsPeriod; label: string }[] = [
  { value: "yearly", label: "年" },
  { value: "monthly", label: "月" },
  { value: "daily", label: "日" },
];

export const PeriodToggle = ({ value, onChange }: PeriodToggleProps) => (
  <View style={styles.container}>
    {OPTIONS.map((opt) => (
      <TouchableOpacity
        key={opt.value}
        style={[styles.option, value === opt.value && styles.optionActive]}
        onPress={() => onChange(opt.value)}
      >
        <Text style={[styles.label, value === opt.value && styles.labelActive]}>
          {opt.label}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#3A3A3A",
    borderRadius: 8,
    padding: 2,
    gap: 2,
  },
  option: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  optionActive: {
    backgroundColor: "#d08000",
  },
  label: {
    fontSize: 12,
    color: "#A1A1AA",
    fontWeight: "600",
  },
  labelActive: {
    color: "#F4F4F4",
  },
});

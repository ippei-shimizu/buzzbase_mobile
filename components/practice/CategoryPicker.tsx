import type { PracticeCategory } from "../../types/practice";
import React from "react";
import { ScrollView, Text, TouchableOpacity, StyleSheet } from "react-native";
import { PRACTICE_CATEGORIES } from "../../constants/practice";

interface Props {
  value: PracticeCategory;
  onChange: (value: PracticeCategory) => void;
}

export function CategoryPicker({ value, onChange }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {PRACTICE_CATEGORIES.map((category) => {
        const active = category.key === value;
        return (
          <TouchableOpacity
            key={category.key}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => onChange(category.key)}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>
              {category.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: 8, paddingVertical: 2 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: "#3A3A3A",
  },
  chipActive: { backgroundColor: "#d08000" },
  chipText: { color: "#A1A1AA", fontSize: 13, fontWeight: "600" },
  chipTextActive: { color: "#FFFFFF" },
});

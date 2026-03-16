import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MultiSelectPicker } from "@components/ui/MultiSelectPicker";

interface Props {
  selectedPositionIds: number[];
  positions: { label: string; value: number }[];
  onSelect: (values: number[]) => void;
}

export const PositionSection = ({
  selectedPositionIds,
  positions,
  onSelect,
}: Props) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>ポジション</Text>
      <MultiSelectPicker
        label="守備位置"
        items={positions}
        selectedValues={selectedPositionIds}
        onSelect={onSelect}
        placeholder="ポジションを選択"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    color: "#F4F4F4",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
});

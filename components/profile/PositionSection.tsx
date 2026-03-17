import React from "react";
import { View, StyleSheet } from "react-native";
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
      <MultiSelectPicker
        label="ポジション（複数選択可）"
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
    marginBottom: 0,
  },
});

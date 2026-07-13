import type { PracticeUnit } from "../../types/practice";
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { PRACTICE_UNITS } from "../../constants/practice";

interface Props {
  value: PracticeUnit;
  onChange: (value: PracticeUnit) => void;
}

/** 計測タイプ（回数 / 時間 / 距離）のセグメント選択。 */
export function UnitPicker({ value, onChange }: Props) {
  return (
    <View style={styles.row}>
      {PRACTICE_UNITS.map((unit) => {
        const active = unit.key === value;
        return (
          <TouchableOpacity
            key={unit.key}
            style={[styles.segment, active && styles.segmentActive]}
            onPress={() => onChange(unit.key)}
          >
            <Text style={[styles.segText, active && styles.segTextActive]}>
              {unit.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#52525B",
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#424242",
  },
  segmentActive: { backgroundColor: "#d08000" },
  segText: { color: "#A1A1AA", fontSize: 14, fontWeight: "600" },
  segTextActive: { color: "#FFFFFF" },
});

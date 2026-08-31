import type { ThrowHand } from "../../types/pitcher";
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import {
  BATTING_SIDES,
  BATTING_SIDE_LABELS,
  THROW_HANDS,
  type BattingSide,
} from "@constants/handedness";
import { THROW_HAND_FULL_LABELS } from "@constants/throwHand";

interface Props {
  throwHand: ThrowHand | null;
  battingSide: BattingSide | null;
  onChangeThrowHand: (value: ThrowHand | null) => void;
  onChangeBattingSide: (value: BattingSide | null) => void;
}

/** プロフィール編集の利き腕（投）・打席セクション。再タップで未選択に戻せる。 */
export const HandednessSection = ({
  throwHand,
  battingSide,
  onChangeThrowHand,
  onChangeBattingSide,
}: Props) => {
  return (
    <View style={styles.section}>
      <View style={styles.field}>
        <Text style={styles.label}>利き腕（投）</Text>
        <View style={styles.chipRow}>
          {THROW_HANDS.map((hand) => {
            const selected = throwHand === hand;
            return (
              <SelectChip
                key={hand}
                label={THROW_HAND_FULL_LABELS[hand]}
                selected={selected}
                onPress={() => onChangeThrowHand(selected ? null : hand)}
              />
            );
          })}
        </View>
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>打席</Text>
        <View style={styles.chipRow}>
          {BATTING_SIDES.map((side) => {
            const selected = battingSide === side;
            return (
              <SelectChip
                key={side}
                label={BATTING_SIDE_LABELS[side]}
                selected={selected}
                onPress={() => onChangeBattingSide(selected ? null : side)}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
};

interface SelectChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

function SelectChip({ label, selected, onPress }: SelectChipProps) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 16,
  },
  field: {},
  label: {
    color: "#F4F4F4",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: "#52525B",
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  chipSelected: {
    backgroundColor: "#d08000",
    borderColor: "#d08000",
  },
  chipText: {
    color: "#D4D4D8",
    fontSize: 13,
  },
  chipTextSelected: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});

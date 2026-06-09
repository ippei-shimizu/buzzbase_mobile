import type { RunnersState } from "../../../../types/plateAppearance";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { RUNNERS_STATE_OPTIONS } from "@constants/runnersState";

interface Props {
  value: RunnersState | null;
  onChange: (value: RunnersState | null) => void;
}

/**
 * ランナー状況 8 択（無走者 〜 満塁）。
 * 同じチップを再選択すると未入力 (null) に戻る。
 */
export function RunnersStateSelector({ value, onChange }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>ランナー状況</Text>
      <View style={styles.chipRow}>
        {RUNNERS_STATE_OPTIONS.map((option) => {
          const selected = value === option.key;
          return (
            <TouchableOpacity
              key={option.key}
              accessibilityRole="button"
              accessibilityLabel={`ランナー状況 ${option.label}`}
              accessibilityState={{ selected }}
              style={[styles.chip, selected && styles.chipSelected]}
              onPress={() => onChange(selected ? null : option.key)}
            >
              <Text
                style={[styles.chipText, selected && styles.chipTextSelected]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    color: "#F4F4F4",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#52525B",
    backgroundColor: "#424242",
  },
  chipSelected: {
    backgroundColor: "#d08000",
    borderColor: "#d08000",
  },
  chipText: {
    color: "#F4F4F4",
    fontSize: 13,
  },
  chipTextSelected: {
    fontWeight: "bold",
  },
});

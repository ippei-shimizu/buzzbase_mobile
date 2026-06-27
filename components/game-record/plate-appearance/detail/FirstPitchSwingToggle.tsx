import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SectionHeader } from "./SectionHeader";

interface Props {
  value: boolean | null;
  onChange: (value: boolean | null) => void;
  description?: string;
}

interface SegmentOption {
  key: "true" | "false";
  label: string;
  value: boolean;
}

const SEGMENTS: SegmentOption[] = [
  { key: "true", label: "はい", value: true },
  { key: "false", label: "いいえ", value: false },
];

/**
 * 初球打ちフラグの 2 値トグル（null/true/false の 3 状態）。
 * 同じ選択肢を再タップすると未選択 (null) に戻る。
 */
export function FirstPitchSwingToggle({ value, onChange, description }: Props) {
  return (
    <View style={styles.container}>
      <SectionHeader label="初球打ち" description={description} />
      <View style={styles.segmentGroup}>
        {SEGMENTS.map((segment) => {
          const selected = value === segment.value;
          return (
            <TouchableOpacity
              key={segment.key}
              accessibilityRole="button"
              accessibilityLabel={`初球打ち ${segment.label}`}
              accessibilityState={{ selected }}
              style={[styles.segment, selected && styles.segmentSelected]}
              onPress={() => onChange(selected ? null : segment.value)}
            >
              <Text
                style={[
                  styles.segmentText,
                  selected && styles.segmentTextSelected,
                ]}
              >
                {segment.label}
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
    marginBottom: 0,
  },
  segmentGroup: {
    flexDirection: "row",
    gap: 8,
  },
  segment: {
    minWidth: 80,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#52525B",
    backgroundColor: "#424242",
    alignItems: "center",
  },
  segmentSelected: {
    backgroundColor: "#d08000",
    borderColor: "#d08000",
  },
  segmentText: {
    color: "#F4F4F4",
    fontSize: 14,
  },
  segmentTextSelected: {
    fontWeight: "bold",
  },
});

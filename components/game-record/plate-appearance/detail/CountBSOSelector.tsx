import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SectionHeader } from "./SectionHeader";

type DetailCountKey = "finalBalls" | "finalStrikes" | "finalOuts";

interface Props {
  balls: number | null;
  strikes: number | null;
  outs: number | null;
  onChange: (key: DetailCountKey, value: number | null) => void;
  description?: string;
}

interface RowConfig {
  key: DetailCountKey;
  label: string;
  /** 取りうる値の最大（ボール=3 / ストライク=2 / アウト=2）。 */
  max: number;
}

const ROWS: RowConfig[] = [
  { key: "finalBalls", label: "ボール", max: 3 },
  { key: "finalStrikes", label: "ストライク", max: 2 },
  { key: "finalOuts", label: "アウト", max: 2 },
];

/**
 * 最終ボールカウント・ストライク・アウトの 3 行セグメント選択。
 * 各行で「未入力」を許容するため、同じ値を再タップすると null に戻る。
 */
export function CountBSOSelector({
  balls,
  strikes,
  outs,
  onChange,
  description,
}: Props) {
  const values: Record<DetailCountKey, number | null> = {
    finalBalls: balls,
    finalStrikes: strikes,
    finalOuts: outs,
  };

  return (
    <View style={styles.container}>
      <SectionHeader label="最終カウント" description={description} />
      {ROWS.map((row) => (
        <SegmentRow
          key={row.key}
          label={row.label}
          max={row.max}
          value={values[row.key]}
          onChange={(next) => onChange(row.key, next)}
        />
      ))}
    </View>
  );
}

interface SegmentRowProps {
  label: string;
  max: number;
  value: number | null;
  onChange: (next: number | null) => void;
}

function SegmentRow({ label, max, value, onChange }: SegmentRowProps) {
  const values = Array.from({ length: max + 1 }, (_, index) => index);
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.segmentGroup}>
        {values.map((segmentValue) => {
          const selected = value === segmentValue;
          return (
            <TouchableOpacity
              key={segmentValue}
              accessibilityRole="button"
              accessibilityLabel={`${label} ${segmentValue}`}
              accessibilityState={{ selected }}
              style={[styles.segment, selected && styles.segmentSelected]}
              onPress={() => onChange(selected ? null : segmentValue)}
            >
              <Text
                style={[
                  styles.segmentText,
                  selected && styles.segmentTextSelected,
                ]}
              >
                {segmentValue}
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  rowLabel: {
    color: "#F4F4F4",
    fontSize: 13,
    width: 88,
  },
  segmentGroup: {
    flexDirection: "row",
    gap: 6,
  },
  segment: {
    minWidth: 38,
    paddingVertical: 6,
    paddingHorizontal: 10,
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

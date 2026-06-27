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
  /** 点灯色（球場のカウントボード配色: ボール=緑 / ストライク=黄 / アウト=赤）。 */
  color: string;
}

const ROWS: RowConfig[] = [
  { key: "finalBalls", label: "ボール", max: 3, color: "#22c55e" },
  { key: "finalStrikes", label: "ストライク", max: 2, color: "#eab308" },
  { key: "finalOuts", label: "アウト", max: 2, color: "#ef4444" },
];

/**
 * 最終ボールカウント・ストライク・アウトを球場カウントボード風のドット UI で入力する。
 * ドットをタップすると現在値までが点灯。すでに点灯済みの最後のドットを再タップで 1 段下げる。
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
      <View style={styles.board}>
        {ROWS.map((row) => (
          <DotRow
            key={row.key}
            label={row.label}
            total={row.max}
            value={values[row.key]}
            color={row.color}
            onChange={(next) => onChange(row.key, next)}
          />
        ))}
      </View>
    </View>
  );
}

interface DotRowProps {
  label: string;
  total: number;
  value: number | null;
  color: string;
  onChange: (next: number | null) => void;
}

function DotRow({ label, total, value, color, onChange }: DotRowProps) {
  const dots = Array.from({ length: total }, (_, index) => index + 1);
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.dotRow}>
        {dots.map((dotIndex) => {
          const isOn = value !== null && value >= dotIndex;
          return (
            <TouchableOpacity
              key={dotIndex}
              accessibilityRole="button"
              accessibilityLabel={`${label} ${dotIndex}`}
              accessibilityState={{ selected: isOn }}
              hitSlop={6}
              onPress={() => {
                // 既に点灯している最後のドットを再タップ → 1 段下げる（0 になったら null）。
                if (value === dotIndex) {
                  onChange(dotIndex === 1 ? null : dotIndex - 1);
                } else {
                  onChange(dotIndex);
                }
              }}
            >
              <View
                style={[
                  styles.dot,
                  isOn
                    ? { backgroundColor: color, borderColor: color }
                    : styles.dotOff,
                ]}
              />
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
  board: {
    backgroundColor: "#1c1c1c",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowLabel: {
    color: "#F4F4F4",
    fontSize: 13,
    fontWeight: "bold",
    width: 80,
  },
  dotRow: {
    flexDirection: "row",
    gap: 12,
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
  },
  dotOff: {
    backgroundColor: "transparent",
    borderColor: "#5a5a5a",
  },
});

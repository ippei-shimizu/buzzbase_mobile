import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { NumberInput } from "@components/ui/NumberInput";

export type ScoreCounterKey =
  | "rbi"
  | "runScored"
  | "stolenBases"
  | "caughtStealing";

interface Props {
  rbi: number;
  runScored: number;
  stolenBases: number;
  caughtStealing: number;
  onChange: (key: ScoreCounterKey, value: number) => void;
}

const ROWS: { key: ScoreCounterKey; label: string }[] = [
  { key: "rbi", label: "打点" },
  { key: "runScored", label: "得点" },
  { key: "stolenBases", label: "盗塁" },
  { key: "caughtStealing", label: "盗塁死" },
];

const PRIMARY_COLOR = "#d08000";
const DISABLED_COLOR = "#52525B";
const TEXT_COLOR = "#F4F4F4";
const MIN_VALUE = 0;

/**
 * 打点・得点・盗塁・盗塁死を +/- アイコン + 数値入力で増減する 4 行ブロック。
 * 数値部は既存の NumberInput を流用しているのでキーボード手入力にも対応する。
 * 値は 0 以上に制限される（0 のとき「減らす」ボタンが disabled）。
 */
export function ScoreCounterInput({
  rbi,
  runScored,
  stolenBases,
  caughtStealing,
  onChange,
}: Props) {
  const values: Record<ScoreCounterKey, number> = {
    rbi,
    runScored,
    stolenBases,
    caughtStealing,
  };
  return (
    <View>
      {ROWS.map((row) => (
        <StepperRow
          key={row.key}
          label={row.label}
          value={values[row.key]}
          onChangeValue={(next) => onChange(row.key, next)}
        />
      ))}
    </View>
  );
}

interface StepperRowProps {
  label: string;
  value: number;
  onChangeValue: (next: number) => void;
}

function StepperRow({ label, value, onChangeValue }: StepperRowProps) {
  const decrementDisabled = value <= MIN_VALUE;
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.stepper}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={`${label}を減らす`}
          accessibilityState={{ disabled: decrementDisabled }}
          disabled={decrementDisabled}
          onPress={() => onChangeValue(Math.max(MIN_VALUE, value - 1))}
          hitSlop={6}
        >
          <Ionicons
            name="remove-circle"
            size={28}
            color={decrementDisabled ? DISABLED_COLOR : PRIMARY_COLOR}
          />
        </TouchableOpacity>
        <NumberInput
          value={value}
          onChangeValue={onChangeValue}
          min={MIN_VALUE}
          style={styles.input}
        />
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={`${label}を増やす`}
          onPress={() => onChangeValue(value + 1)}
          hitSlop={6}
        >
          <Ionicons name="add-circle" size={28} color={PRIMARY_COLOR} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#3a3a3a",
  },
  label: {
    color: TEXT_COLOR,
    fontSize: 15,
    flex: 1,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  input: {
    width: 64,
  },
});

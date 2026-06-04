import { View } from "react-native";
import { NumberInputRow } from "@components/game-record/NumberInputRow";

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

/**
 * 打点・得点・盗塁・盗塁死を +/- 入力する 4 行ブロック。
 * 既存 `NumberInputRow` をそのまま 4 回使い、親に key 単位で変更を通知する。
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
        <NumberInputRow
          key={row.key}
          label={row.label}
          value={values[row.key]}
          onChangeValue={(next) => onChange(row.key, next)}
        />
      ))}
    </View>
  );
}

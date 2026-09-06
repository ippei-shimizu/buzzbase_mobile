import type { RunnersState } from "../../../../types/plateAppearance";
import { StyleSheet, View } from "react-native";
import { RunnersDiamond } from "@components/baseball/RunnersDiamond";
import { SectionHeader } from "./SectionHeader";

interface Props {
  value: RunnersState | null;
  onChange: (value: RunnersState | null) => void;
  description?: string;
}

/**
 * ランナー状況を各塁のタップで指定するダイヤモンド UI。
 * 未入力(null)と無走者(no_runner)の区別は RunnersDiamond 側のルールに従う。
 */
export function RunnersStateSelector({ value, onChange, description }: Props) {
  return (
    <View style={styles.container}>
      <SectionHeader label="ランナー状況" description={description} />
      <RunnersDiamond value={value} onChange={onChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 0,
  },
});

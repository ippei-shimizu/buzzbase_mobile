import { StyleSheet, View } from "react-native";
import { BSOBoard, type BSOKey } from "@components/baseball/BSOBoard";
import { SectionHeader } from "./SectionHeader";

type DetailCountKey = "finalBalls" | "finalStrikes" | "finalOuts";

interface Props {
  balls: number | null;
  strikes: number | null;
  outs: number | null;
  onChange: (key: DetailCountKey, value: number | null) => void;
  description?: string;
}

const DETAIL_KEY_BY_BSO: Record<BSOKey, DetailCountKey> = {
  balls: "finalBalls",
  strikes: "finalStrikes",
  outs: "finalOuts",
};

/**
 * 最終ボールカウント・ストライク・アウトを球場カウントボード風のドット UI で入力する。
 * 描画は共通の BSOBoard に委譲し、DetailState 向けのキー変換だけを担う。
 */
export function CountBSOSelector({
  balls,
  strikes,
  outs,
  onChange,
  description,
}: Props) {
  return (
    <View style={styles.container}>
      <SectionHeader label="最終カウント" description={description} />
      <BSOBoard
        balls={balls}
        strikes={strikes}
        outs={outs}
        onChange={(key, value) => onChange(DETAIL_KEY_BY_BSO[key], value)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 0,
  },
});

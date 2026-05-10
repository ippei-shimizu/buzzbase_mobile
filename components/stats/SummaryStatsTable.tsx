import { StyleSheet, Text, View } from "react-native";
import { StatTooltipLabel } from "@components/ui/StatTooltipLabel";
import { getStatTooltip } from "./statTooltips";

/**
 * `[左ラベル, 左の値, 右ラベル, 右の値]` の 4 要素タプル。
 *
 * 1 行に左右 2 組のラベル/値ペアを並べる「成績概要テーブル」用の行データ。
 * ダッシュボード / マイページの成績タブで共通利用する。
 */
export type SummaryStatsRow = [
  string,
  string | number,
  string,
  string | number,
];

interface Props {
  rows: SummaryStatsRow[];
}

/**
 * ラベル文字列がツールチップ登録済みなら StatTooltipLabel に、
 * そうでなければ通常の Text として描画する。
 *
 * 「ラベル == ツールチップキー」とすることで、各画面側がツールチップの有無を
 * 意識せずに rows を渡すだけで自動的に補足表示が付くようにしている。
 */
function CellLabel({ label }: { label: string }) {
  const tooltip = getStatTooltip(label);
  if (!tooltip || !label) {
    return <Text style={styles.cellLabel}>{label}</Text>;
  }
  return (
    <StatTooltipLabel
      label={label}
      tooltip={tooltip}
      containerStyle={styles.cellLabelTrigger}
      textStyle={styles.cellLabelText}
    />
  );
}

/**
 * 成績概要テーブル（左右 2 列のラベル/値ペアを並べる形式）。
 *
 * ダッシュボードとマイページの成績タブで共通利用する。
 * ラベル文字列をキーに `getStatTooltip` を引いて、登録済みのラベルには
 * 自動的にツールチップを付ける。新指標を追加したい場合は `statTooltips.ts`
 * にエントリを足すだけで全画面に反映される。
 */
export function SummaryStatsTable({ rows }: Props) {
  return (
    <View style={styles.table}>
      {rows.map((row, i) => (
        <View key={i} style={styles.tableRow}>
          <CellLabel label={row[0]} />
          <Text style={styles.cellValue}>{row[1]}</Text>
          <CellLabel label={row[2]} />
          <Text style={styles.cellValue}>{row[3]}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  table: {
    borderWidth: 1,
    borderColor: "#71717b",
    borderRadius: 8,
    overflow: "hidden",
  },
  tableRow: {
    flexDirection: "row",
  },
  cellLabel: {
    flex: 1,
    color: "#A1A1AA",
    fontSize: 13,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#27272a",
    borderBottomWidth: 1,
    borderBottomColor: "#71717b",
    borderRightWidth: 1,
    borderRightColor: "#71717b",
  },
  // ツールチップ付きラベルセル: cellLabel と同じ枠を Pressable に当て、内側 Text で文字色だけ持たせる。
  // alignItems: 'flex-start' を入れて、内側の labelInline（破線アンダーライン付き View）が
  // 親いっぱいに stretch せず文字幅にフィットするようにする。
  cellLabelTrigger: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: "flex-start",
    backgroundColor: "#27272a",
    borderBottomWidth: 1,
    borderBottomColor: "#71717b",
    borderRightWidth: 1,
    borderRightColor: "#71717b",
  },
  cellLabelText: {
    color: "#A1A1AA",
    fontSize: 13,
  },
  cellValue: {
    flex: 1,
    color: "#F4F4F4",
    fontSize: 13,
    fontWeight: "600",
    paddingVertical: 10,
    paddingHorizontal: 12,
    textAlign: "center",
    backgroundColor: "#424242",
    borderBottomWidth: 1,
    borderBottomColor: "#71717b",
    borderRightWidth: 1,
    borderRightColor: "#71717b",
  },
});

import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

/**
 * ダミーデータの上に表示する「サンプルデータ」見出し。
 * 無料ユーザー向けのPro機能プレビュー（実データではない）であることを明示する。
 */
export function SampleDataLabel() {
  return (
    <View style={styles.row}>
      <Ionicons name="eye-outline" size={13} color="#A1A1AA" />
      <Text style={styles.text}>
        サンプルデータ（実際の記録ではありません）
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 16,
    marginBottom: 8,
  },
  text: {
    color: "#A1A1AA",
    fontSize: 12,
    fontWeight: "600",
  },
});

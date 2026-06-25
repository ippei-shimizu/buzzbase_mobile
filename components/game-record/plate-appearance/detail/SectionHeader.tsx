import { StyleSheet, Text, View } from "react-native";

interface Props {
  /** セクション見出し（例: "最終カウント"）。 */
  label: string;
  /**
   * セクションの説明文（任意）。初めて使うユーザーが「何を記録すれば良いか」を
   * 素早く理解できるよう、1〜2 文の短い解説を表示する。
   */
  description?: string;
}

/**
 * 詳細データ入力 Step3 の各セクション共通ヘッダー。
 * ラベル + 説明文をひとまとめにし、視覚的なリズムを統一する。
 */
export function SectionHeader({ label, description }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  label: {
    color: "#F4F4F4",
    fontSize: 14,
    fontWeight: "bold",
  },
  description: {
    color: "#A1A1AA",
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
});

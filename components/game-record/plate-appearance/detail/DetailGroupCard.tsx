import type { ComponentProps, ReactNode } from "react";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

interface Props {
  /** カード見出しの大ラベル（例: "打席の状況"）。 */
  title: string;
  /** 見出し横の Ionicons 名（識別性を上げて視覚的にスキャンしやすくする）。 */
  iconName: IoniconName;
  /** 補助テキスト（例: "打席時の状況を記録"）。 */
  subtitle?: string;
  /** 内側に並べるセクション群。`SectionDivider` を間に入れて視覚的に区切る。 */
  children: ReactNode;
}

/**
 * 詳細データ入力 Step3 で使う「グループカード」コンテナ。
 * 9 セクションをフラットに並べると視認性が悪いため、関連項目を 3 つのカードにまとめ、
 * 各カードに大見出し + アイコンを付けて章立てを明示する。
 */
export function DetailGroupCard({
  title,
  iconName,
  subtitle,
  children,
}: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name={iconName} size={20} color="#d08000" />
        <View style={styles.headerTexts}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.body}>{children}</View>
    </View>
  );
}

/**
 * カード内のセクション間に挿入する細い区切り線。
 */
export function SectionDivider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#383838",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#4a4a4a",
  },
  headerTexts: {
    flex: 1,
  },
  title: {
    color: "#F4F4F4",
    fontSize: 15,
    fontWeight: "bold",
  },
  subtitle: {
    color: "#A1A1AA",
    fontSize: 12,
    marginTop: 2,
  },
  body: {
    gap: 0,
  },
  divider: {
    height: 1,
    backgroundColor: "#4a4a4a",
    marginVertical: 16,
  },
});

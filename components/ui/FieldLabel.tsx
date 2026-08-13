import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface Props {
  text: string;
  /** true で「必須」、省略/false で「任意」バッジを表示する。 */
  required?: boolean;
}

/** フォーム項目ラベル。必須/任意をバッジで視覚的に示す。 */
export function FieldLabel({ text, required = false }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{text}</Text>
      <View
        style={[styles.badge, required ? styles.required : styles.optional]}
      >
        <Text
          style={[
            styles.badgeText,
            required ? styles.requiredText : styles.optionalText,
          ]}
        >
          {required ? "必須" : "任意"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
    marginBottom: 8,
  },
  label: { color: "#A1A1AA", fontSize: 13, fontWeight: "600" },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  required: { backgroundColor: "rgba(243, 18, 96, 0.18)" },
  optional: { backgroundColor: "#3A3A3A" },
  badgeText: { fontSize: 10, fontWeight: "700" },
  requiredText: { color: "#F87187" },
  optionalText: { color: "#A1A1AA" },
});

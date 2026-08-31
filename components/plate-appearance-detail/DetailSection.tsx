import React from "react";
import { StyleSheet, Text, View } from "react-native";

/** 打席詳細画面のセクションカード（タイトル + 行の集まり）。 */
export function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: "#424242",
    borderRadius: 12,
    padding: 16,
  },
  title: {
    color: "#F4F4F4",
    fontSize: 15,
    fontWeight: "bold",
  },
  body: {
    marginTop: 4,
  },
});

import React, { type ReactNode } from "react";
import { View, Text, StyleSheet } from "react-native";

interface Props {
  title: string;
  children: ReactNode;
}

/**
 * 活動面の各セクションの共通カード枠。
 * 各 Pro 機能 PR が children に実体（草・スケジュール・記録導線等）を差し込む。
 */
export function SectionCard({ title, children }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {children}
    </View>
  );
}

/** 機能未実装セクションの空状態表示。 */
export function SectionPlaceholder({ message }: { message: string }) {
  return <Text style={styles.placeholder}>{message}</Text>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#3A3A3A",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  title: {
    color: "#F4F4F4",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 10,
  },
  placeholder: {
    color: "#A1A1AA",
    fontSize: 13,
  },
});

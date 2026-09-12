import React, { type ReactNode } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface Props {
  title: string;
  /** タイトル下に添える1行程度の補足説明。 */
  description?: string;
  children: ReactNode;
}

/**
 * 活動面の各セクションの共通カード枠。
 * 各 Pro 機能 PR が children に実体（草・スケジュール・記録導線等）を差し込む。
 */
export function SectionCard({ title, description, children }: Props) {
  return (
    <View style={styles.card}>
      <Text style={[styles.title, description && styles.titleWithDescription]}>
        {title}
      </Text>
      {description ? (
        <Text style={styles.description}>{description}</Text>
      ) : null}
      {children}
    </View>
  );
}

/** 機能未実装セクションの空状態表示。 */
export function SectionPlaceholder({ message }: { message: string }) {
  return <Text style={styles.placeholder}>{message}</Text>;
}

/** 取得失敗を空状態と区別して表示し、リトライ導線を提供する。 */
export function SectionError({ onRetry }: { onRetry: () => void }) {
  return (
    <View style={styles.errorRow}>
      <Text style={styles.errorText}>読み込みに失敗しました</Text>
      <TouchableOpacity
        onPress={onRetry}
        accessibilityRole="button"
        accessibilityLabel="再試行"
        hitSlop={8}
      >
        <Text style={styles.retryText}>再試行</Text>
      </TouchableOpacity>
    </View>
  );
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
  titleWithDescription: {
    marginBottom: 4,
  },
  description: {
    color: "#A1A1AA",
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 10,
  },
  placeholder: {
    color: "#A1A1AA",
    fontSize: 13,
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  errorText: { color: "#A1A1AA", fontSize: 13 },
  retryText: { color: "#d08000", fontSize: 13, fontWeight: "700" },
});

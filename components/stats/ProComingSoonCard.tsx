import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface ProComingSoonCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

/**
 * Pro プラン限定機能のリリース前告知カード。
 * タイトル・説明は読める状態のまま、children（ダミー body）を BlurView でボカし、
 * ブラーの上に「Pro プラン (準備中)」バッジを重ねて機能の事前訴求を行う。
 */
export function ProComingSoonCard({
  title,
  description,
  children,
}: ProComingSoonCardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <View style={styles.previewWrapper} pointerEvents="none">
        {children}
        <BlurView intensity={18} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.overlay}>
          <View style={styles.badge}>
            <Ionicons name="lock-closed" size={13} color="#1A1A1A" />
            <Text style={styles.badgeText}>Pro プラン (準備中)</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#3A3A3A",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  title: {
    color: "#F4F4F4",
    fontSize: 16,
    fontWeight: "700",
  },
  description: {
    color: "#A1A1AA",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
  },
  previewWrapper: {
    position: "relative",
    marginTop: 12,
    borderRadius: 8,
    overflow: "hidden",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#d08000",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  badgeText: {
    color: "#1A1A1A",
    fontSize: 13,
    fontWeight: "800",
  },
});

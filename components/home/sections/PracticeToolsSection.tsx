import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, StyleSheet } from "react-native";
import { SectionCard } from "./SectionCard";

/**
 * 練習ツール（素振りカウントタイマー）。
 * 主記録導線（練習を記録 / 野球ノート）は最上部の RecordButtonsSection に分離している。
 */
export function PracticeToolsSection() {
  const router = useRouter();

  return (
    <SectionCard
      title="練習ツール"
      description="一定のタイミングでお知らせしながら、素振りの回数を数えます"
    >
      <TouchableOpacity
        style={styles.swingButton}
        onPress={() => router.push("/(shadow-swing)/setup")}
      >
        <Ionicons name="timer-outline" size={20} color="#FFFFFF" />
        <Text style={styles.swingText}>素振りカウントタイマー</Text>
      </TouchableOpacity>
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  swingButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#d08000",
    borderRadius: 8,
    paddingVertical: 14,
  },
  swingText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
});

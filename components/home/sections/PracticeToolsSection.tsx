import type { PracticeMenu } from "../../../types/practice";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { usePracticeLogMutations } from "@hooks/usePracticeLogs";
import { usePracticeMenus } from "@hooks/usePracticeMenus";
import { formatAmount } from "@utils/formatAmount";
import { SectionCard } from "./SectionCard";

const todayString = (): string => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
};

/**
 * 練習ツール（素振りタイマー / お気に入りメニューのワンタップ記録）。
 * 主記録導線（練習を記録 / 野球ノート）は最上部の RecordButtonsSection に分離している。
 */
export function PracticeToolsSection() {
  const router = useRouter();
  const { menus } = usePracticeMenus();
  const { createLog, isCreating } = usePracticeLogMutations();
  const favorites = menus.filter((menu) => menu.is_favorite).slice(0, 3);

  const quickLog = async (menu: PracticeMenu) => {
    try {
      await createLog({
        practice_menu_id: menu.id,
        logged_on: todayString(),
        amount: menu.default_value,
      });
    } catch {
      // ワンタップ記録の失敗は静かに無視（一覧で気付ける）。
    }
  };

  return (
    <SectionCard title="練習ツール">
      <TouchableOpacity
        style={styles.swingButton}
        onPress={() => router.push("/(shadow-swing)/setup")}
      >
        <Ionicons name="timer-outline" size={20} color="#FFFFFF" />
        <Text style={styles.swingText}>素振りタイマー</Text>
      </TouchableOpacity>
      {favorites.length > 0 ? (
        <>
          <Text style={styles.favLabel}>お気に入りをワンタップ記録</Text>
          <View style={styles.favRow}>
            {favorites.map((menu) => (
              <TouchableOpacity
                key={menu.id}
                style={styles.favChip}
                disabled={isCreating}
                onPress={() => quickLog(menu)}
              >
                <Ionicons name="add" size={14} color="#d08000" />
                <Text style={styles.favText}>
                  {menu.name}
                  {menu.default_value != null
                    ? ` ${formatAmount(menu.default_value)}${menu.unit_label ?? ""}`
                    : ""}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      ) : null}
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
  favLabel: {
    color: "#A1A1AA",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 8,
  },
  favRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  favChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#424242",
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  favText: { color: "#F4F4F4", fontSize: 13, fontWeight: "600" },
});

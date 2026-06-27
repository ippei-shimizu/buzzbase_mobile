import type { PracticeMenu } from "../../../types/practice";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { usePracticeLogMutations } from "@hooks/usePracticeLogs";
import { usePracticeMenus } from "@hooks/usePracticeMenus";
import { SectionCard } from "./SectionCard";

const todayString = (): string => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
};

/**
 * クイック記録（お気に入りワンタップ / 練習を記録 / コンディション）。
 * 素振り導線は #319 で追加する。
 */
export function QuickRecordSection() {
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
    <SectionCard title="クイック記録">
      {favorites.length > 0 ? (
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
                  ? ` ${menu.default_value}${menu.unit_label ?? ""}`
                  : ""}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("/(practice-record)/menu-list")}
        >
          <Ionicons name="barbell-outline" size={20} color="#F4F4F4" />
          <Text style={styles.actionText}>練習を記録</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("/(practice-record)/condition")}
        >
          <Ionicons name="pulse-outline" size={20} color="#F4F4F4" />
          <Text style={styles.actionText}>コンディション</Text>
        </TouchableOpacity>
      </View>
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  favRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 10 },
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
  actionRow: { flexDirection: "row", gap: 8 },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#424242",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  actionText: { color: "#F4F4F4", fontSize: 13, fontWeight: "600" },
});

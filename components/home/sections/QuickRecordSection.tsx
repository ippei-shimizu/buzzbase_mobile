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
 * 記録（練習を記録 / 野球ノート / お気に入りワンタップ / 素振りタイマー）。
 * 練習を記録・野球ノートを主動線として最上段に置く。コンディションは練習記録の中で入力する。
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
    <SectionCard title="記録">
      <View style={styles.primaryRow}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push("/(practice-record)/daily")}
        >
          <Ionicons name="barbell-outline" size={22} color="#FFFFFF" />
          <Text style={styles.primaryText}>練習を記録</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push("/(note)/new")}
        >
          <Ionicons name="create-outline" size={22} color="#FFFFFF" />
          <Text style={styles.primaryText}>野球ノートを記録</Text>
        </TouchableOpacity>
      </View>
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
          onPress={() => router.push("/(shadow-swing)/setup")}
        >
          <Ionicons name="timer-outline" size={20} color="#F4F4F4" />
          <Text style={styles.actionText}>素振りタイマー</Text>
        </TouchableOpacity>
      </View>
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  primaryRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  primaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#d08000",
    borderRadius: 8,
    paddingVertical: 16,
  },
  primaryText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
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

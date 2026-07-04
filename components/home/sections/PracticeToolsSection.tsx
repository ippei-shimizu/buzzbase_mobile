import type { PracticeMenu } from "../../../types/practice";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { usePracticeLogMutations } from "@hooks/usePracticeLogs";
import { usePracticeMenus } from "@hooks/usePracticeMenus";
import { useSnackbarStore } from "@stores/snackbarStore";
import { formatAmount } from "@utils/formatAmount";
import { SectionCard } from "./SectionCard";

/** メニュー名＋既定値を「素振り 200本」のように表示用に整形する。 */
const menuLabel = (menu: PracticeMenu): string =>
  menu.default_value != null
    ? `${menu.name} ${formatAmount(menu.default_value)}${menu.unit_label ?? ""}`
    : menu.name;

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
  const showSnackbar = useSnackbarStore((state) => state.show);
  const favorites = menus.filter((menu) => menu.is_favorite).slice(0, 3);

  const quickLog = async (menu: PracticeMenu) => {
    // 記録できたか/失敗したかをユーザーに必ずフィードバックする（無反応だと気付けない）。
    try {
      await createLog({
        practice_menu_id: menu.id,
        logged_on: todayString(),
        amount: menu.default_value,
      });
      showSnackbar({
        type: "success",
        message: `今日の練習に「${menuLabel(menu)}」を記録しました`,
      });
    } catch {
      showSnackbar({ type: "error", message: "記録に失敗しました" });
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
                style={[styles.favChip, isCreating && styles.favChipDisabled]}
                disabled={isCreating}
                onPress={() => quickLog(menu)}
              >
                <Ionicons name="add" size={14} color="#d08000" />
                <Text style={styles.favText}>{menuLabel(menu)}</Text>
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
  favChipDisabled: { opacity: 0.5 },
  favText: { color: "#F4F4F4", fontSize: 13, fontWeight: "600" },
});

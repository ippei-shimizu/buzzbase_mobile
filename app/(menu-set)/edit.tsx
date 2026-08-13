import type { MenuSetInput } from "../../types/menuSet";
import type { PracticeMenu } from "../../types/practice";
import { isAxiosError } from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { Icon } from "@components/icon/Icon";
import { KeyboardAwareScreen } from "@components/ui/KeyboardAwareScreen";
import { useMenuSets, useMenuSetMutations } from "@hooks/useMenuSets";
import { usePracticeMenus } from "@hooks/usePracticeMenus";
import { serverErrorMessage } from "@utils/axiosError";
import { formatAmount } from "@utils/formatAmount";

// バックエンドの MenuSet#name のバリデーション（length: { maximum: 50 }）に合わせる。
const MENU_SET_NAME_MAX_LENGTH = 50;

export default function MenuSetEditScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const editingId = params.id ? Number(params.id) : null;

  const { menuSets } = useMenuSets();
  const editing = editingId
    ? menuSets.find((set) => set.id === editingId)
    : undefined;

  const { menus } = usePracticeMenus();
  const { createMenuSet, updateMenuSet, isCreating, isUpdating } =
    useMenuSetMutations();

  const [name, setName] = useState(editing?.name ?? "");
  const [note, setNote] = useState(editing?.note ?? "");
  // 選択メニューの目標量（menu_id → 編集途中文字列）。既存セットは items の target_value を初期値にする。
  const [menuAmounts, setMenuAmounts] = useState<Record<number, string>>(() => {
    const initial: Record<number, string> = {};
    editing?.items.forEach((item) => {
      initial[item.practice_menu_id] = formatAmount(item.target_value);
    });
    return initial;
  });

  const toggleMenu = (menu: PracticeMenu) =>
    setMenuAmounts((prev) => {
      if (menu.id in prev) {
        const next = { ...prev };
        delete next[menu.id];
        return next;
      }
      return { ...prev, [menu.id]: formatAmount(menu.default_value) };
    });
  const setMenuAmount = (menuId: number, amount: string) =>
    setMenuAmounts((prev) => ({ ...prev, [menuId]: amount }));

  const handleSave = async () => {
    if (!name.trim()) return Alert.alert("セット名を入力してください");

    const input: MenuSetInput = {
      name: name.trim(),
      note: note.trim() || null,
      items: Object.entries(menuAmounts).map(([id, amount]) => ({
        practice_menu_id: Number(id),
        target_value: amount.trim() ? Number(amount) : null,
      })),
    };

    try {
      if (editingId) {
        await updateMenuSet({ id: editingId, input });
      } else {
        await createMenuSet(input);
      }
      router.back();
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 403) {
        Alert.alert(
          "無料プランの上限",
          "メニューセットは無料で2つまでです。Pro で無制限に登録できます。",
          [
            { text: "閉じる", style: "cancel" },
            { text: "Pro を見る", onPress: () => router.push("/pro") },
          ],
        );
      } else {
        Alert.alert("保存に失敗しました", serverErrorMessage(error));
      }
    }
  };

  const saving = isCreating || isUpdating;

  return (
    <KeyboardAwareScreen>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.label}>セット名</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          // バックエンドの name は50文字までなので、超過して422になる前に入力段階で止める。
          maxLength={MENU_SET_NAME_MAX_LENGTH}
          placeholder="例: オフ日ルーティン"
          placeholderTextColor="#71717A"
        />

        <Text style={styles.label}>メモ（任意）</Text>
        <TextInput
          style={styles.input}
          value={note}
          onChangeText={setNote}
          placeholder="例: 試合前日の軽め調整"
          placeholderTextColor="#71717A"
        />

        <Text style={styles.label}>メニュー</Text>
        {menus.length === 0 ? (
          <Text style={styles.hint}>
            練習メニューがありません。先に練習記録からメニューを作成してください。
          </Text>
        ) : (
          <View>
            {menus.map((menu) => {
              const isSelected = menu.id in menuAmounts;
              return (
                <View key={menu.id} style={styles.menuItem}>
                  <TouchableOpacity
                    style={styles.menuItemRow}
                    onPress={() => toggleMenu(menu)}
                  >
                    <Icon
                      name={isSelected ? "checkbox" : "square-outline"}
                      size={22}
                      color={isSelected ? "#d08000" : "#71717A"}
                    />
                    <Text style={styles.menuItemName}>{menu.name}</Text>
                  </TouchableOpacity>
                  {isSelected ? (
                    <View style={styles.amountRow}>
                      <TextInput
                        style={styles.amountInput}
                        value={menuAmounts[menu.id]}
                        onChangeText={(text) => setMenuAmount(menu.id, text)}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor="#71717A"
                      />
                      <Text style={styles.unitLabel}>
                        {menu.unit_label ?? "回"}
                      </Text>
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>
        )}

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {editingId ? "更新" : "作成"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAwareScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#2E2E2E" },
  content: { padding: 16, paddingBottom: 48 },
  label: {
    color: "#A1A1AA",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#3A3A3A",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: "#F4F4F4",
    fontSize: 15,
  },
  hint: { color: "#71717A", fontSize: 13 },
  menuItem: {
    backgroundColor: "#3A3A3A",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 8,
  },
  menuItemRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  menuItemName: { color: "#F4F4F4", fontSize: 15, fontWeight: "600", flex: 1 },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
    marginLeft: 32,
  },
  amountInput: {
    width: 120,
    backgroundColor: "#2E2E2E",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#F4F4F4",
    fontSize: 16,
    fontWeight: "700",
  },
  unitLabel: { color: "#A1A1AA", fontSize: 15 },
  saveButton: {
    backgroundColor: "#d08000",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 28,
  },
  saveButtonDisabled: { opacity: 0.5 },
  saveButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
});

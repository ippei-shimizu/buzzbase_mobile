import type { MenuSetInput } from "../../types/menuSet";
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
import { useMenuSets, useMenuSetMutations } from "@hooks/useMenuSets";
import { usePracticeMenus } from "@hooks/usePracticeMenus";

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
  const [selectedMenus, setSelectedMenus] = useState<number[]>(
    editing?.items.map((item) => item.practice_menu_id) ?? [],
  );

  const toggleMenu = (id: number) =>
    setSelectedMenus((prev) =>
      prev.includes(id) ? prev.filter((menu) => menu !== id) : [...prev, id],
    );

  const handleSave = async () => {
    if (!name.trim()) return Alert.alert("セット名を入力してください");

    const input: MenuSetInput = {
      name: name.trim(),
      note: note.trim() || null,
      items: selectedMenus.map((id) => {
        const menu = menus.find((item) => item.id === id);
        return {
          practice_menu_id: id,
          target_value: menu?.default_value ?? null,
        };
      }),
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
        Alert.alert("保存に失敗しました");
      }
    }
  };

  const saving = isCreating || isUpdating;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>セット名</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
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
        <View style={styles.menuWrap}>
          {menus.map((menu) => {
            const active = selectedMenus.includes(menu.id);
            return (
              <TouchableOpacity
                key={menu.id}
                style={[styles.menuChip, active && styles.menuChipActive]}
                onPress={() => toggleMenu(menu.id)}
              >
                <Text
                  style={[styles.menuText, active && styles.menuTextActive]}
                >
                  {menu.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <TouchableOpacity
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.saveButtonText}>{editingId ? "更新" : "作成"}</Text>
      </TouchableOpacity>
    </ScrollView>
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
  menuWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  menuChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: "#3A3A3A",
  },
  menuChipActive: { backgroundColor: "#d08000" },
  menuText: { color: "#A1A1AA", fontSize: 13, fontWeight: "600" },
  menuTextActive: { color: "#FFFFFF" },
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

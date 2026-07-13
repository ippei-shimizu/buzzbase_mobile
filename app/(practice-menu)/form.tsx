import type {
  PracticeCategory,
  PracticeMenu,
  PracticeUnit,
} from "../../types/practice";
import { isAxiosError } from "axios";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { CategoryPicker } from "@components/practice/CategoryPicker";
import { UnitPicker } from "@components/practice/UnitPicker";
import { FieldLabel } from "@components/ui/FieldLabel";
import { PRACTICE_UNITS } from "@constants/practice";
import {
  usePracticeMenuMutations,
  usePracticeMenus,
} from "@hooks/usePracticeMenus";

export default function PracticeMenuFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { menus, isLoading } = usePracticeMenus();
  const editing = id ? menus.find((menu) => menu.id === Number(id)) : undefined;

  // 編集モードでメニュー取得待ちの間はスピナー（初期値を正しく埋めるため）。
  if (id && isLoading && !editing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#d08000" />
      </View>
    );
  }

  return <MenuForm key={editing?.id ?? "new"} menu={editing} />;
}

/** 作成・編集の共通フォーム。menu があれば編集、なければ新規作成。 */
function MenuForm({ menu }: { menu?: PracticeMenu }) {
  const router = useRouter();
  const { createMenu, isCreating, updateMenu, isUpdating } =
    usePracticeMenuMutations();
  const [name, setName] = useState(menu?.name ?? "");
  const [category, setCategory] = useState<PracticeCategory>(
    menu?.category ?? "batting",
  );
  const [unit, setUnit] = useState<PracticeUnit>(menu?.unit ?? "count");
  const [defaultValue, setDefaultValue] = useState(
    menu?.default_value != null ? String(menu.default_value) : "",
  );
  const isSaving = isCreating || isUpdating;

  const unitMeta =
    PRACTICE_UNITS.find((item) => item.key === unit) ?? PRACTICE_UNITS[0];

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("メニュー名を入力してください");
      return;
    }
    const input = {
      name: name.trim(),
      category,
      unit,
      // 表示ラベルは計測タイプから自動で決める（回数=本、時間=分 など）。
      unit_label: unitMeta.defaultLabel,
      // 記録時のプリセット量（日次記録やスケジュールの初期値に使う）。任意。
      default_value: defaultValue ? Number(defaultValue) : null,
    };
    try {
      if (menu) {
        await updateMenu({ id: menu.id, input });
      } else {
        await createMenu(input);
      }
      router.back();
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 403) {
        Alert.alert(
          "無料プランの上限",
          "練習メニューは無料で5つまでです。Pro で無制限に登録できます。",
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen
        options={{ title: menu ? "メニューを編集" : "メニューを作る" }}
      />
      <FieldLabel text="名前" required />
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="例: 素振り、ティー、ランニング"
        placeholderTextColor="#71717A"
      />

      <FieldLabel text="カテゴリ" required />
      <CategoryPicker
        value={category}
        onChange={(next) => {
          setCategory(next);
          // 筋トレは重さ×回数を既定にする。
          if (next === "strength") setUnit("weight_reps");
          else if (unit === "weight_reps") setUnit("count");
        }}
      />

      <FieldLabel text="計測" required />
      <UnitPicker value={unit} onChange={setUnit} />

      <FieldLabel text="初期値（任意）" />
      <View style={styles.valueRow}>
        <TextInput
          style={[styles.input, styles.valueInput]}
          value={defaultValue}
          onChangeText={setDefaultValue}
          keyboardType="numeric"
          placeholder={`例: ${unitMeta.placeholderValue}`}
          placeholderTextColor="#71717A"
        />
        <Text style={styles.valueUnit}>{unitMeta.defaultLabel}</Text>
      </View>
      <Text style={styles.hint}>
        記録するときに初期表示される量です。毎回変更できます。
      </Text>

      <TouchableOpacity
        style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={isSaving}
      >
        <Text style={styles.saveButtonText}>保存</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#2E2E2E" },
  centered: {
    flex: 1,
    backgroundColor: "#2E2E2E",
    alignItems: "center",
    justifyContent: "center",
  },
  content: { padding: 16, paddingBottom: 40 },
  input: {
    backgroundColor: "#3A3A3A",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: "#F4F4F4",
    fontSize: 15,
  },
  valueRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  valueInput: { flex: 1 },
  valueUnit: { color: "#A1A1AA", fontSize: 15 },
  hint: { color: "#71717A", fontSize: 12, marginTop: 6 },
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

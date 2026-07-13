import type { ImprovementTheme } from "../../types/improvementTheme";
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
import { THEME_CATEGORIES } from "@constants/improvementTheme";
import {
  useImprovementThemeMutations,
  useImprovementThemes,
} from "@hooks/useImprovementThemes";

export default function ThemeFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { themes, isLoading } = useImprovementThemes();
  const editing = id
    ? themes.find((theme) => theme.id === Number(id))
    : undefined;

  // 編集モードで課題取得待ちの間はスピナー（初期値を正しく埋めるため）。
  if (id && isLoading && !editing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#d08000" />
      </View>
    );
  }

  return <ThemeForm key={editing?.id ?? "new"} editing={editing} />;
}

/** 作成・編集の共通フォーム。editing があれば編集モード。 */
function ThemeForm({ editing }: { editing?: ImprovementTheme }) {
  const router = useRouter();
  const { createTheme, isCreating, updateTheme, isUpdating } =
    useImprovementThemeMutations();
  const [title, setTitle] = useState(editing?.title ?? "");
  const [category, setCategory] = useState<string | null>(
    editing?.category ?? "batting",
  );
  const [purpose, setPurpose] = useState(editing?.purpose ?? "");
  const isSaving = isCreating || isUpdating;

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert("課題のタイトルを入力してください");
      return;
    }
    const input = {
      title: title.trim(),
      category,
      purpose: purpose.trim() || null,
    };
    try {
      if (editing) {
        await updateTheme({ id: editing.id, input });
      } else {
        await createTheme(input);
      }
      router.back();
    } catch {
      Alert.alert("保存に失敗しました");
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen
        options={{ title: editing ? "課題を編集" : "課題を決める" }}
      />
      <Text style={styles.label}>いま取り組む課題</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="例: 肩の開きを抑える"
        placeholderTextColor="#71717A"
      />

      <Text style={styles.label}>カテゴリ</Text>
      <View style={styles.chips}>
        {THEME_CATEGORIES.map((item) => (
          <TouchableOpacity
            key={item.value}
            style={[styles.chip, category === item.value && styles.chipActive]}
            onPress={() => setCategory(item.value)}
          >
            <Text
              style={[
                styles.chipText,
                category === item.value && styles.chipTextActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>目的・メモ（任意）</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        value={purpose}
        onChangeText={setPurpose}
        multiline
        placeholder="何のために取り組むか。克服の基準など"
        placeholderTextColor="#71717A"
      />

      <TouchableOpacity
        style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
        onPress={handleSubmit}
        disabled={isSaving}
      >
        <Text style={styles.saveButtonText}>
          {editing ? "更新" : "この課題に取り組む"}
        </Text>
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
  multiline: { minHeight: 90, textAlignVertical: "top" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    backgroundColor: "#3A3A3A",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipActive: { backgroundColor: "#d08000" },
  chipText: { color: "#F4F4F4", fontSize: 13 },
  chipTextActive: { color: "#F4F4F4", fontWeight: "700" },
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

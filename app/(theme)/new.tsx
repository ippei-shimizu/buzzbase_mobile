import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { THEME_CATEGORIES } from "@constants/improvementTheme";
import { useImprovementThemeMutations } from "@hooks/useImprovementThemes";

export default function ThemeNewScreen() {
  const router = useRouter();
  const { createTheme, isCreating } = useImprovementThemeMutations();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string | null>("batting");
  const [purpose, setPurpose] = useState("");

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert("課題のタイトルを入力してください");
      return;
    }
    try {
      await createTheme({
        title: title.trim(),
        category,
        purpose: purpose.trim() || null,
      });
      router.back();
    } catch {
      Alert.alert("保存に失敗しました");
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
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
        style={[styles.saveButton, isCreating && styles.saveButtonDisabled]}
        onPress={handleSubmit}
        disabled={isCreating}
      >
        <Text style={styles.saveButtonText}>この課題に取り組む</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#2E2E2E" },
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
  chipTextActive: { color: "#1A1A1A", fontWeight: "700" },
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

import type { PracticeCategory, PracticeUnit } from "../../types/practice";
import { isAxiosError } from "axios";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
} from "react-native";
import { CategoryPicker } from "@components/practice/CategoryPicker";
import { UnitPicker } from "@components/practice/UnitPicker";
import { PRACTICE_UNITS } from "@constants/practice";
import { usePracticeMenuMutations } from "@hooks/usePracticeMenus";

export default function MenuNewScreen() {
  const router = useRouter();
  const { createMenu, isCreating } = usePracticeMenuMutations();
  const [name, setName] = useState("");
  const [category, setCategory] = useState<PracticeCategory>("batting");
  const [unit, setUnit] = useState<PracticeUnit>("count");
  const [unitLabel, setUnitLabel] = useState("");
  const [defaultValue, setDefaultValue] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);

  const unitMeta =
    PRACTICE_UNITS.find((item) => item.key === unit) ?? PRACTICE_UNITS[0];

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("メニュー名を入力してください");
      return;
    }
    try {
      await createMenu({
        name: name.trim(),
        category,
        unit,
        unit_label: unitLabel.trim() || unitMeta.defaultLabel,
        default_value: defaultValue ? Number(defaultValue) : null,
        is_favorite: isFavorite,
      });
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
      <Text style={styles.label}>名前</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="例: 素振り、ティー、ランニング"
        placeholderTextColor="#71717A"
      />

      <Text style={styles.label}>カテゴリ</Text>
      <CategoryPicker value={category} onChange={setCategory} />

      <Text style={styles.label}>計測</Text>
      <UnitPicker value={unit} onChange={setUnit} />

      <Text style={styles.label}>単位表示</Text>
      <TextInput
        style={styles.input}
        value={unitLabel}
        onChangeText={setUnitLabel}
        placeholder={unitMeta.defaultLabel}
        placeholderTextColor="#71717A"
      />

      <Text style={styles.label}>既定値（任意）</Text>
      <TextInput
        style={styles.input}
        value={defaultValue}
        onChangeText={setDefaultValue}
        keyboardType="numeric"
        placeholder={`例: ${unitMeta.placeholderValue}`}
        placeholderTextColor="#71717A"
      />

      <View style={styles.favoriteRow}>
        <Text style={styles.favoriteLabel}>
          お気に入りにする（ホームに表示）
        </Text>
        <Switch
          value={isFavorite}
          onValueChange={setIsFavorite}
          trackColor={{ true: "#d08000", false: "#52525B" }}
        />
      </View>

      <TouchableOpacity
        style={[styles.saveButton, isCreating && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={isCreating}
      >
        <Text style={styles.saveButtonText}>保存</Text>
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
  favoriteRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 24,
  },
  favoriteLabel: { color: "#F4F4F4", fontSize: 14 },
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

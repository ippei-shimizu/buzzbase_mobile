import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { INPUT_OPTIONS, METRIC_OPTIONS } from "@constants/insight";
import { useInsightCombinationMutations } from "@hooks/useCorrelationInsights";
import { usePracticeMenus } from "@hooks/usePracticeMenus";

type InputMode = "fixed" | "menu";

export default function CreateInsightCombinationScreen() {
  const router = useRouter();
  const { menus } = usePracticeMenus();
  const { createCombination, isCreating } = useInsightCombinationMutations();

  const [inputMode, setInputMode] = useState<InputMode>("fixed");
  const [fixedInput, setFixedInput] = useState<string | null>(null);
  const [menuId, setMenuId] = useState<number | null>(null);
  const [metric, setMetric] = useState<string | null>(null);

  const activeMenus = menus;

  const handleSave = async () => {
    if (!metric) return Alert.alert("成績を選んでください");
    const inputType = inputMode === "menu" ? "practice_menu" : fixedInput;
    if (inputMode === "menu" && !menuId) {
      return Alert.alert("練習メニューを選んでください");
    }
    if (inputMode === "fixed" && !fixedInput) {
      return Alert.alert("入力を選んでください");
    }
    try {
      await createCombination({
        input_type: inputType as string,
        practice_menu_id: inputMode === "menu" ? menuId : null,
        metric,
      });
      router.back();
    } catch {
      Alert.alert(
        "作成できませんでした",
        "同じ組み合わせや上限の可能性があります",
      );
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.intro}>
        「やったこと」と「成績」を1つずつ選ぶと、週ごとの傾向カードが作られます。
      </Text>

      <Text style={styles.label}>入力（やったこと）</Text>
      <View style={styles.segment}>
        {(
          [
            { key: "fixed", label: "コンディション・練習量" },
            { key: "menu", label: "練習メニュー" },
          ] as const
        ).map((item) => {
          const active = inputMode === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              style={[styles.segItem, active && styles.segItemActive]}
              onPress={() => setInputMode(item.key)}
            >
              <Text style={[styles.segText, active && styles.segTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {inputMode === "fixed" ? (
        <View style={styles.chips}>
          {INPUT_OPTIONS.map((option) => {
            const active = fixedInput === option.key;
            return (
              <TouchableOpacity
                key={option.key}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setFixedInput(option.key)}
              >
                <Text
                  style={[styles.chipText, active && styles.chipTextActive]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : activeMenus.length === 0 ? (
        <Text style={styles.empty}>練習メニューがありません</Text>
      ) : (
        <View style={styles.chips}>
          {activeMenus.map((menu) => {
            const active = menuId === menu.id;
            return (
              <TouchableOpacity
                key={menu.id}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setMenuId(menu.id)}
              >
                <Text
                  style={[styles.chipText, active && styles.chipTextActive]}
                >
                  {menu.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <Text style={styles.label}>成績</Text>
      <View style={styles.chips}>
        {METRIC_OPTIONS.map((option) => {
          const active = metric === option.key;
          return (
            <TouchableOpacity
              key={option.key}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => setMetric(option.key)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={[styles.saveButton, isCreating && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={isCreating}
      >
        <Text style={styles.saveButtonText}>作成する</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#2E2E2E" },
  content: { padding: 16, paddingBottom: 40 },
  intro: {
    color: "#D4D4D8",
    fontSize: 13,
    lineHeight: 20,
    backgroundColor: "#3A3A3A",
    borderRadius: 10,
    padding: 12,
  },
  label: {
    color: "#A1A1AA",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 8,
  },
  segment: { flexDirection: "row", gap: 8, marginBottom: 12 },
  segItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#3A3A3A",
  },
  segItemActive: { backgroundColor: "#d08000" },
  segText: { color: "#A1A1AA", fontSize: 13, fontWeight: "600" },
  segTextActive: { color: "#FFFFFF" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    backgroundColor: "#3A3A3A",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipActive: { backgroundColor: "#d08000" },
  chipText: { color: "#F4F4F4", fontSize: 13 },
  chipTextActive: { color: "#FFFFFF", fontWeight: "700" },
  empty: { color: "#A1A1AA", fontSize: 13 },
  saveButton: {
    backgroundColor: "#d08000",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 32,
  },
  saveButtonDisabled: { opacity: 0.5 },
  saveButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
});

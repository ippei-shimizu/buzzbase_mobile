import type { ConditionLogInput } from "../../types/practice";
import { useRouter } from "expo-router";
import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import { ConditionForm } from "@components/practice/ConditionForm";
import { ProGate } from "@components/pro/ProGate";
import {
  useConditionLog,
  useConditionLogMutations,
} from "@hooks/useConditionLog";

const todayString = (): string => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
};

function ConditionEditor() {
  const router = useRouter();
  const date = todayString();
  const { conditionLog, isLoading } = useConditionLog(date);
  const { saveCondition, isSaving } = useConditionLogMutations(date);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#d08000" />
      </View>
    );
  }

  const handleSave = async (input: ConditionLogInput) => {
    try {
      await saveCondition(input);
      Alert.alert("保存しました", "今日のコンディションを記録しました", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert("保存に失敗しました");
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>今日のコンディション</Text>
      <ConditionForm
        date={date}
        initial={conditionLog}
        onSave={handleSave}
        isSaving={isSaving}
      />
    </ScrollView>
  );
}

function LockedView({ onUpgrade }: { onUpgrade: () => void }) {
  return (
    <View style={styles.locked}>
      <Text style={styles.lockedTitle}>コンディション記録は Pro 限定です</Text>
      <Text style={styles.lockedText}>
        疲労・体調・睡眠・気分・怪我を記録して、成績との関係を振り返れます
      </Text>
      <TouchableOpacity style={styles.upgradeButton} onPress={onUpgrade}>
        <Text style={styles.upgradeText}>Pro を見る</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function ConditionScreen() {
  return (
    <ProGate
      feature="detailed_condition_log"
      renderLockedTrigger={(open) => <LockedView onUpgrade={open} />}
    >
      <ConditionEditor />
    </ProGate>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#2E2E2E" },
  content: { padding: 16, paddingBottom: 40 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { color: "#F4F4F4", fontSize: 18, fontWeight: "700" },
  locked: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  lockedTitle: {
    color: "#F4F4F4",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  lockedText: {
    color: "#A1A1AA",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  upgradeButton: {
    backgroundColor: "#d08000",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  upgradeText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
});

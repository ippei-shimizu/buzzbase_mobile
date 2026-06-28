import type { GoalPeriodType } from "../../types/goal";
import DateTimePicker from "@react-native-community/datetimepicker";
import { isAxiosError } from "axios";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import { GOAL_METRICS } from "@constants/goal";
import { useEntitlement } from "@hooks/useEntitlement";
import { useGoalMutations } from "@hooks/useGoals";
import { useMySeasons } from "@hooks/useSeasons";

const pad = (value: number): string => String(value).padStart(2, "0");
const dateString = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export default function GoalNewScreen() {
  const router = useRouter();
  const { createGoal, isCreating } = useGoalMutations();
  const { seasons } = useMySeasons();
  const { hasEntitlement } = useEntitlement();
  const canSeason = hasEntitlement("season_goals");

  const [periodType, setPeriodType] = useState<GoalPeriodType>("monthly");
  const [metricKey, setMetricKey] = useState(GOAL_METRICS[0].key);
  const [target, setTarget] = useState("");
  const [title, setTitle] = useState("");
  const [seasonId, setSeasonId] = useState<number | null>(null);
  const [deadline, setDeadline] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 90);
    return date;
  });
  const [showPicker, setShowPicker] = useState(false);

  const metric =
    GOAL_METRICS.find((item) => item.key === metricKey) ?? GOAL_METRICS[0];

  const handleSave = async () => {
    if (!target) return Alert.alert("目標値を入力してください");
    if (periodType === "season" && !seasonId) {
      return Alert.alert("シーズンを選択してください");
    }
    const now = new Date();
    const monthStart = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`;
    const monthEnd = dateString(
      new Date(now.getFullYear(), now.getMonth() + 1, 0),
    );

    try {
      await createGoal({
        title: title.trim() || `${metric.label}目標`,
        period_type: periodType,
        season_id: periodType === "season" ? seasonId : null,
        month_start: periodType === "monthly" ? monthStart : null,
        deadline: periodType === "monthly" ? monthEnd : dateString(deadline),
        metric_key: metricKey,
        target_value: Number(target),
        comparison_type: metric.comparison,
      });
      router.back();
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 403) {
        Alert.alert("Pro プラン", "この目標は Pro プランで設定できます", [
          { text: "閉じる", style: "cancel" },
          { text: "Pro を見る", onPress: () => router.push("/pro") },
        ]);
      } else {
        Alert.alert("保存に失敗しました");
      }
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>種類</Text>
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.seg, periodType === "monthly" && styles.segActive]}
          onPress={() => setPeriodType("monthly")}
        >
          <Text
            style={[
              styles.segText,
              periodType === "monthly" && styles.segTextActive,
            ]}
          >
            月次
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.seg, periodType === "season" && styles.segActive]}
          onPress={() => setPeriodType("season")}
        >
          <Text
            style={[
              styles.segText,
              periodType === "season" && styles.segTextActive,
            ]}
          >
            シーズン{canSeason ? "" : "（Pro）"}
          </Text>
        </TouchableOpacity>
      </View>

      {periodType === "season" && !canSeason ? (
        <View style={styles.proNote}>
          <Text style={styles.proText}>シーズン目標は Pro プラン限定です</Text>
          <TouchableOpacity onPress={() => router.push("/pro")}>
            <Text style={styles.proLink}>Pro を見る</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {periodType === "monthly" ? (
        <Text style={styles.hint}>対象期間: 今月（自動設定）</Text>
      ) : (
        <>
          <Text style={styles.label}>シーズン</Text>
          <View style={styles.chipWrap}>
            {seasons.map((season) => {
              const active = season.id === seasonId;
              return (
                <TouchableOpacity
                  key={season.id}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setSeasonId(season.id)}
                >
                  <Text
                    style={[styles.chipText, active && styles.chipTextActive]}
                  >
                    {season.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={styles.label}>期限</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowPicker((prev) => !prev)}
          >
            <Text style={styles.inputText}>{dateString(deadline)}</Text>
          </TouchableOpacity>
          {showPicker ? (
            <DateTimePicker
              value={deadline}
              mode="date"
              themeVariant="dark"
              display={Platform.OS === "ios" ? "inline" : "default"}
              onChange={(_event, selected) => {
                if (Platform.OS !== "ios") setShowPicker(false);
                if (selected) setDeadline(selected);
              }}
            />
          ) : null}
        </>
      )}

      <Text style={styles.label}>指標</Text>
      <View style={styles.chipWrap}>
        {GOAL_METRICS.map((item) => {
          const active = item.key === metricKey;
          return (
            <TouchableOpacity
              key={item.key}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => setMetricKey(item.key)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <Text style={styles.hint}>
        条件: {metric.comparison === "less_than" ? "以下" : "以上"}
      </Text>

      <Text style={styles.label}>目標値</Text>
      <TextInput
        style={styles.input}
        value={target}
        onChangeText={setTarget}
        keyboardType="numeric"
        placeholder={metric.decimal ? "例: 0.300" : "例: 20"}
        placeholderTextColor="#71717A"
      />

      <Text style={styles.label}>タイトル（任意）</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder={`${metric.label}目標`}
        placeholderTextColor="#71717A"
      />

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
  row: { flexDirection: "row", gap: 8 },
  seg: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#3A3A3A",
  },
  segActive: { backgroundColor: "#d08000" },
  segText: { color: "#A1A1AA", fontSize: 14, fontWeight: "600" },
  segTextActive: { color: "#FFFFFF" },
  proNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#3A3A3A",
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  proText: { color: "#A1A1AA", fontSize: 13 },
  proLink: { color: "#d08000", fontSize: 13, fontWeight: "700" },
  hint: { color: "#71717A", fontSize: 12, marginTop: 8 },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: "#3A3A3A",
  },
  chipActive: { backgroundColor: "#d08000" },
  chipText: { color: "#A1A1AA", fontSize: 13, fontWeight: "600" },
  chipTextActive: { color: "#FFFFFF" },
  input: {
    backgroundColor: "#3A3A3A",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: "#F4F4F4",
    fontSize: 15,
  },
  inputText: { color: "#F4F4F4", fontSize: 15 },
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

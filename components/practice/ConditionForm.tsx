import type {
  ConditionLog,
  ConditionLogInput,
  Injury,
} from "../../types/practice";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { CONDITION_MOODS } from "../../constants/practice";
import { InjuryInput } from "./InjuryInput";

interface Props {
  date: string;
  initial: ConditionLog | null;
  onSave: (input: ConditionLogInput) => Promise<void> | void;
  isSaving: boolean;
}

const LEVELS: { value: number; emoji: string }[] = [
  { value: 1, emoji: "😣" },
  { value: 2, emoji: "😟" },
  { value: 3, emoji: "🙂" },
  { value: 4, emoji: "😄" },
];

function LevelSelector({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (value: number) => void;
}) {
  return (
    <View style={styles.levelRow}>
      {LEVELS.map((level) => {
        const active = level.value === value;
        return (
          <TouchableOpacity
            key={level.value}
            style={[styles.levelButton, active && styles.levelButtonActive]}
            onPress={() => onChange(level.value)}
          >
            <Text style={styles.levelEmoji}>{level.emoji}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

/** コンディション入力フォーム（疲労/体調/睡眠/気分/怪我）。全項目任意・部分保存可。 */
export function ConditionForm({ date, initial, onSave, isSaving }: Props) {
  const [fatigue, setFatigue] = useState<number | null>(
    initial?.fatigue_level ?? null,
  );
  const [physical, setPhysical] = useState<number | null>(
    initial?.physical_level ?? null,
  );
  const [sleep, setSleep] = useState(
    initial?.sleep_hours != null ? String(initial.sleep_hours) : "",
  );
  const [mood, setMood] = useState<string | null>(initial?.mood ?? null);
  const [memo, setMemo] = useState(initial?.memo ?? "");
  const [injuries, setInjuries] = useState<Injury[]>(initial?.injuries ?? []);

  const handleSave = () =>
    onSave({
      logged_on: date,
      fatigue_level: fatigue,
      physical_level: physical,
      sleep_hours: sleep ? Number(sleep) : null,
      mood,
      memo: memo.trim() || null,
      injuries,
    });

  return (
    <View>
      <Text style={styles.label}>疲労度</Text>
      <LevelSelector value={fatigue} onChange={setFatigue} />

      <Text style={styles.label}>体調</Text>
      <LevelSelector value={physical} onChange={setPhysical} />

      <Text style={styles.label}>睡眠</Text>
      <View style={styles.sleepRow}>
        <TextInput
          style={styles.sleepInput}
          value={sleep}
          onChangeText={setSleep}
          keyboardType="numeric"
          placeholder="7.0"
          placeholderTextColor="#71717A"
        />
        <Text style={styles.unit}>時間</Text>
      </View>

      <Text style={styles.label}>気分</Text>
      <View style={styles.moodRow}>
        {CONDITION_MOODS.map((item) => {
          const active = item === mood;
          return (
            <TouchableOpacity
              key={item}
              style={[styles.moodChip, active && styles.moodChipActive]}
              onPress={() => setMood(active ? null : item)}
            >
              <Text style={[styles.moodText, active && styles.moodTextActive]}>
                {item}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <TextInput
        style={styles.memoInput}
        value={memo}
        onChangeText={setMemo}
        placeholder="気分のメモ（任意）"
        placeholderTextColor="#71717A"
      />

      <Text style={styles.label}>怪我・痛み</Text>
      <InjuryInput injuries={injuries} onChange={setInjuries} />

      <TouchableOpacity
        style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={isSaving}
      >
        <Text style={styles.saveButtonText}>保存</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    color: "#A1A1AA",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  levelRow: { flexDirection: "row", gap: 10 },
  levelButton: {
    width: 56,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#3A3A3A",
    alignItems: "center",
    justifyContent: "center",
  },
  levelButtonActive: { backgroundColor: "#d08000" },
  levelEmoji: { fontSize: 22 },
  sleepRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  sleepInput: {
    width: 100,
    backgroundColor: "#3A3A3A",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#F4F4F4",
    fontSize: 15,
  },
  unit: { color: "#A1A1AA", fontSize: 14 },
  moodRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  moodChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: "#3A3A3A",
  },
  moodChipActive: { backgroundColor: "#d08000" },
  moodText: { color: "#A1A1AA", fontSize: 13, fontWeight: "600" },
  moodTextActive: { color: "#FFFFFF" },
  memoInput: {
    backgroundColor: "#3A3A3A",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#F4F4F4",
    fontSize: 14,
  },
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

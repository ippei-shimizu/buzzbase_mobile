import type { Injury } from "../../types/practice";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { CONDITION_MOODS } from "../../constants/practice";
import { InjuryInput } from "./InjuryInput";

/** コンディション入力の編集状態。睡眠は編集途中の文字列で保持する。 */
export interface ConditionDraft {
  fatigue_level: number | null;
  physical_level: number | null;
  sleep_hours: string;
  mood: string | null;
  memo: string;
  injuries: Injury[];
}

export const EMPTY_CONDITION_DRAFT: ConditionDraft = {
  fatigue_level: null,
  physical_level: null,
  sleep_hours: "",
  mood: null,
  memo: "",
  injuries: [],
};

interface Props {
  value: ConditionDraft;
  onChange: (next: ConditionDraft) => void;
}

// emoji は RN で表示されない端末があるため Ionicons を使う。色は悪い→良いで赤→緑。
const LEVELS: {
  value: number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}[] = [
  { value: 1, icon: "sad", color: "#ef4444" },
  { value: 2, icon: "sad-outline", color: "#f59e0b" },
  { value: 3, icon: "happy-outline", color: "#84cc16" },
  { value: 4, icon: "happy", color: "#22c55e" },
];

const FATIGUE_LABELS = ["かなり疲れ", "やや疲れ", "ふつう", "元気"];
const PHYSICAL_LABELS = ["不調", "やや不調", "ふつう", "好調"];

function LevelSelector({
  value,
  onChange,
  labels,
}: {
  value: number | null;
  onChange: (value: number) => void;
  labels: string[];
}) {
  return (
    <View style={styles.levelRow}>
      {LEVELS.map((level, index) => {
        const active = level.value === value;
        return (
          <TouchableOpacity
            key={level.value}
            style={[styles.levelButton, active && styles.levelButtonActive]}
            onPress={() => onChange(level.value)}
          >
            <Ionicons name={level.icon} size={26} color={level.color} />
            <Text
              style={[styles.levelLabel, active && styles.levelLabelActive]}
            >
              {labels[index]}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

/**
 * コンディション入力フォーム（疲労/体調/睡眠/気分/怪我）。
 * 値と onChange を親が持つ制御コンポーネント。保存は親（練習セッション）側で一括して行う。
 */
export function ConditionForm({ value, onChange }: Props) {
  const patch = (partial: Partial<ConditionDraft>) =>
    onChange({ ...value, ...partial });

  return (
    <View>
      <Text style={styles.label}>疲労度</Text>
      <LevelSelector
        value={value.fatigue_level}
        onChange={(fatigue_level) => patch({ fatigue_level })}
        labels={FATIGUE_LABELS}
      />

      <Text style={styles.label}>体調</Text>
      <LevelSelector
        value={value.physical_level}
        onChange={(physical_level) => patch({ physical_level })}
        labels={PHYSICAL_LABELS}
      />

      <Text style={styles.label}>睡眠</Text>
      <View style={styles.sleepRow}>
        <TextInput
          style={styles.sleepInput}
          value={value.sleep_hours}
          onChangeText={(sleep_hours) => patch({ sleep_hours })}
          keyboardType="numeric"
          placeholder="7.0"
          placeholderTextColor="#71717A"
        />
        <Text style={styles.unit}>時間</Text>
      </View>

      <Text style={styles.label}>気分</Text>
      <View style={styles.moodRow}>
        {CONDITION_MOODS.map((item) => {
          const active = item === value.mood;
          return (
            <TouchableOpacity
              key={item}
              style={[styles.moodChip, active && styles.moodChipActive]}
              onPress={() => patch({ mood: active ? null : item })}
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
        value={value.memo}
        onChangeText={(memo) => patch({ memo })}
        placeholder="気分のメモ（任意）"
        placeholderTextColor="#71717A"
      />

      <Text style={styles.label}>怪我・痛み</Text>
      <InjuryInput
        injuries={value.injuries}
        onChange={(injuries) => patch({ injuries })}
      />
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
  levelRow: { flexDirection: "row", gap: 8 },
  levelButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#3A3A3A",
    borderWidth: 2,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  levelButtonActive: { borderColor: "#d08000" },
  levelLabel: { color: "#A1A1AA", fontSize: 11, fontWeight: "600" },
  levelLabelActive: { color: "#F4F4F4" },
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
});

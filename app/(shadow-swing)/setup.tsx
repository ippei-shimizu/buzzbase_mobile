import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import {
  useShadowSwingMutations,
  useShadowSwingStats,
} from "@hooks/useShadowSwing";

const INTERVALS = [1.0, 1.5, 2.0, 3.0];

export default function ShadowSwingSetupScreen() {
  const router = useRouter();
  const { startSession, isStarting } = useShadowSwingMutations();
  const { stats } = useShadowSwingStats();
  const [target, setTarget] = useState("200");
  const [interval, setIntervalValue] = useState(2.0);
  const [vibration, setVibration] = useState(true);

  const handleStart = async () => {
    const targetCount = Number(target);
    if (!targetCount || targetCount < 1) {
      Alert.alert("目標本数を入力してください");
      return;
    }
    try {
      const session = await startSession(targetCount);
      router.push({
        pathname: "/(shadow-swing)/counter",
        params: {
          sessionId: String(session.id),
          target: String(targetCount),
          interval: String(interval),
          vibration: vibration ? "1" : "0",
        },
      });
    } catch {
      Alert.alert("開始に失敗しました");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>目標本数</Text>
      <View style={styles.targetRow}>
        <TextInput
          style={styles.targetInput}
          value={target}
          onChangeText={setTarget}
          keyboardType="numeric"
          placeholder="200"
          placeholderTextColor="#71717A"
        />
        <Text style={styles.unit}>本</Text>
      </View>

      <Text style={styles.label}>インターバル</Text>
      <View style={styles.optionRow}>
        {INTERVALS.map((value) => {
          const active = value === interval;
          return (
            <TouchableOpacity
              key={value}
              style={[styles.option, active && styles.optionActive]}
              onPress={() => setIntervalValue(value)}
            >
              <Text
                style={[styles.optionText, active && styles.optionTextActive]}
              >
                {value.toFixed(1)}秒
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.label}>バイブレーション</Text>
      <View style={styles.optionRow}>
        {[
          { key: true, label: "あり" },
          { key: false, label: "なし" },
        ].map((item) => {
          const active = item.key === vibration;
          return (
            <TouchableOpacity
              key={String(item.key)}
              style={[styles.option, active && styles.optionActive]}
              onPress={() => setVibration(item.key)}
            >
              <Text
                style={[styles.optionText, active && styles.optionTextActive]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={[styles.startButton, isStarting && styles.startButtonDisabled]}
        onPress={handleStart}
        disabled={isStarting}
      >
        <Text style={styles.startButtonText}>開始する</Text>
      </TouchableOpacity>

      {stats ? (
        <Text style={styles.total}>
          通算 {stats.total_count.toLocaleString()}本
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#2E2E2E", padding: 16 },
  label: {
    color: "#A1A1AA",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  targetRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  targetInput: {
    flex: 1,
    backgroundColor: "#3A3A3A",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: "#F4F4F4",
    fontSize: 18,
    fontWeight: "700",
  },
  unit: { color: "#A1A1AA", fontSize: 15 },
  optionRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  option: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#3A3A3A",
  },
  optionActive: { backgroundColor: "#d08000" },
  optionText: { color: "#A1A1AA", fontSize: 14, fontWeight: "600" },
  optionTextActive: { color: "#FFFFFF" },
  startButton: {
    backgroundColor: "#d08000",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 32,
  },
  startButtonDisabled: { opacity: 0.5 },
  startButtonText: { color: "#FFFFFF", fontSize: 17, fontWeight: "700" },
  total: { color: "#71717A", fontSize: 13, textAlign: "center", marginTop: 16 },
});

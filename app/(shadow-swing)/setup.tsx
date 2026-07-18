import { Ionicons } from "@expo/vector-icons";
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
} from "react-native";
import { PaywallModal } from "@components/pro/PaywallModal";
import { useEntitlement } from "@hooks/useEntitlement";
import {
  useShadowSwingMutations,
  useShadowSwingStats,
} from "@hooks/useShadowSwing";

const INTERVALS = [
  1.0, 1.5, 2.0, 3.0, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
  20,
];

// 無料プランで選択できるインターバルの範囲（back の Entitlement 'shadow_swing_custom_interval' と対応）。
const FREE_INTERVAL_MIN = 5;
const FREE_INTERVAL_MAX = 10;

export default function ShadowSwingSetupScreen() {
  const router = useRouter();
  const { startSession, isStarting } = useShadowSwingMutations();
  const { stats } = useShadowSwingStats();
  const { hasEntitlement } = useEntitlement();
  const canCustomInterval = hasEntitlement("shadow_swing_custom_interval");
  const canVibration = hasEntitlement("shadow_swing_vibration");
  const [target, setTarget] = useState("200");
  const [interval, setIntervalValue] = useState(5.0);
  const [vibration, setVibration] = useState(false);
  const [sound, setSound] = useState(true);
  const [voice, setVoice] = useState(false);
  const [isIntervalPaywallOpen, setIntervalPaywallOpen] = useState(false);
  const [isVibrationPaywallOpen, setVibrationPaywallOpen] = useState(false);

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
          sound: sound ? "1" : "0",
          voice: voice ? "1" : "0",
        },
      });
    } catch {
      Alert.alert("開始に失敗しました");
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.intro}>
        設定したインターバルで自動的にカウントアップし、素振りの本数を練習記録に
        保存します。笛の音や読み上げでテンポを取りながら振れます。
      </Text>

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
          const locked =
            !canCustomInterval &&
            (value < FREE_INTERVAL_MIN || value > FREE_INTERVAL_MAX);
          return (
            <TouchableOpacity
              key={value}
              style={[
                styles.option,
                active && styles.optionActive,
                locked && styles.optionLocked,
              ]}
              onPress={() => {
                if (locked) {
                  setIntervalPaywallOpen(true);
                  return;
                }
                setIntervalValue(value);
              }}
            >
              <Text
                style={[styles.optionText, active && styles.optionTextActive]}
              >
                {value.toFixed(1)}秒
              </Text>
              {locked ? (
                <Ionicons
                  name="lock-closed"
                  size={10}
                  color="#71717A"
                  style={styles.lockIcon}
                />
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>
      {!canCustomInterval ? (
        <Text style={styles.hint}>
          無料プランはインターバル{FREE_INTERVAL_MIN}〜{FREE_INTERVAL_MAX}
          秒のみ選択できます。Pro で1〜20秒の全範囲を解放できます。
        </Text>
      ) : null}

      <Text style={styles.hint}>
        「笛の音」と「カウント読み上げ」はどちらか一方のみ選べます。
      </Text>

      <Text style={styles.label}>笛の音</Text>
      <View style={styles.optionRow}>
        {[
          { key: true, label: "あり" },
          { key: false, label: "なし" },
        ].map((item) => {
          const active = item.key === sound;
          return (
            <TouchableOpacity
              key={String(item.key)}
              style={[styles.option, active && styles.optionActive]}
              // 笛と読み上げは排他。笛をONにしたら読み上げをOFFにする。
              onPress={() => {
                setSound(item.key);
                if (item.key) setVoice(false);
              }}
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

      <Text style={styles.label}>カウント読み上げ</Text>
      <View style={styles.optionRow}>
        {[
          { key: true, label: "あり" },
          { key: false, label: "なし" },
        ].map((item) => {
          const active = item.key === voice;
          return (
            <TouchableOpacity
              key={String(item.key)}
              style={[styles.option, active && styles.optionActive]}
              // 笛と読み上げは排他。読み上げをONにしたら笛をOFFにする。
              onPress={() => {
                setVoice(item.key);
                if (item.key) setSound(false);
              }}
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

      <Text style={styles.label}>バイブレーション</Text>
      <View style={styles.optionRow}>
        {[
          { key: true, label: "あり" },
          { key: false, label: "なし" },
        ].map((item) => {
          const active = item.key === vibration;
          const locked = !canVibration && item.key;
          return (
            <TouchableOpacity
              key={String(item.key)}
              style={[
                styles.option,
                active && styles.optionActive,
                locked && styles.optionLocked,
              ]}
              onPress={() => {
                if (locked) {
                  setVibrationPaywallOpen(true);
                  return;
                }
                setVibration(item.key);
              }}
            >
              <Text
                style={[styles.optionText, active && styles.optionTextActive]}
              >
                {item.label}
              </Text>
              {locked ? (
                <Ionicons
                  name="lock-closed"
                  size={10}
                  color="#71717A"
                  style={styles.lockIcon}
                />
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>
      {!canVibration ? (
        <Text style={styles.hint}>
          バイブレーションは Pro プラン限定の機能です。
        </Text>
      ) : null}

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

      <PaywallModal
        isOpen={isIntervalPaywallOpen}
        onClose={() => setIntervalPaywallOpen(false)}
        feature="shadow_swing_custom_interval"
      />
      <PaywallModal
        isOpen={isVibrationPaywallOpen}
        onClose={() => setVibrationPaywallOpen(false)}
        feature="shadow_swing_vibration"
      />
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
    marginTop: 16,
    marginBottom: 8,
  },
  hint: {
    color: "#71717A",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 16,
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
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#3A3A3A",
  },
  optionActive: { backgroundColor: "#d08000" },
  optionLocked: { opacity: 0.5 },
  optionText: { color: "#A1A1AA", fontSize: 14, fontWeight: "600" },
  optionTextActive: { color: "#FFFFFF" },
  lockIcon: { marginLeft: 2 },
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

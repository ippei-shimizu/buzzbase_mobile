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
import { Icon } from "@components/icon/Icon";
import { PaywallModal } from "@components/pro/PaywallModal";
import { KeyboardAwareScreen } from "@components/ui/KeyboardAwareScreen";
import { useEntitlement } from "@hooks/useEntitlement";
import {
  useShadowSwingMutations,
  useShadowSwingStats,
} from "@hooks/useShadowSwing";
import { serverErrorMessage } from "@utils/axiosError";

const INTERVALS = [
  1.0, 1.5, 2.0, 3.0, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
  20,
];

// 無料プランで選択できるインターバルの範囲（back の Entitlement 'shadow_swing_custom_interval' と対応）。
const FREE_INTERVAL_MIN = 5;
const FREE_INTERVAL_MAX = 8;

export default function ShadowSwingSetupScreen() {
  const router = useRouter();
  const { startSession, isStarting } = useShadowSwingMutations();
  const { stats } = useShadowSwingStats();
  const { hasEntitlement, isLoading: isProLoading } = useEntitlement();
  // pro/status 解決前は解放扱いにして、Pro ユーザーへのロック表示フラッシュを防ぐ。
  const canCustomInterval =
    isProLoading || hasEntitlement("shadow_swing_custom_interval");
  const canVibration = isProLoading || hasEntitlement("shadow_swing_vibration");
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
      const session = await startSession({
        target_count: targetCount,
        interval_seconds: interval,
        vibration_enabled: vibration,
        sound_enabled: sound,
        voice_enabled: voice,
      });
      // カウンターの動作はサーバーが受理した設定に従う。Pro 限定値の可否判定を
      // クライアント側の表示ロックだけに依存させない。
      router.push({
        pathname: "/(shadow-swing)/counter",
        params: {
          sessionId: String(session.id),
          target: String(session.target_count),
          interval: String(session.interval_seconds),
          vibration: session.vibration_enabled ? "1" : "0",
          sound: session.sound_enabled ? "1" : "0",
          voice: session.voice_enabled ? "1" : "0",
        },
      });
    } catch (thrown) {
      Alert.alert(serverErrorMessage(thrown) ?? "開始に失敗しました");
    }
  };

  return (
    <KeyboardAwareScreen>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.intro}>
          設定したインターバルでアプリが自動で素振りの回数を数えてくれます。振った
          本数は練習記録に保存され、笛の音や読み上げでテンポを取りながら振れます。
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
                  <Icon
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
                  <Icon
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
    </KeyboardAwareScreen>
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

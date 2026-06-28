import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Vibration,
  StyleSheet,
} from "react-native";
import { useShadowSwingMutations } from "@hooks/useShadowSwing";

export default function ShadowSwingCounterScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    sessionId: string;
    target: string;
    interval: string;
    vibration: string;
  }>();
  const { completeSession } = useShadowSwingMutations();

  const targetCount = Number(params.target) || 0;
  const intervalMs = (Number(params.interval) || 2) * 1000;
  const useVibration = params.vibration === "1";
  const sessionId = Number(params.sessionId);

  const [count, setCount] = useState(0);
  const [running, setRunning] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const finishedRef = useRef(false);

  // インターバルごとに自動カウントアップ（＋バイブ）。
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setCount((prev) => prev + 1);
      if (useVibration) Vibration.vibrate(40);
    }, intervalMs);
    return () => clearInterval(id);
  }, [running, intervalMs, useVibration]);

  // 経過時間。
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setElapsed((prev) => prev + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  const finish = useCallback(
    async (swing: number) => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      setRunning(false);
      try {
        await completeSession({ id: sessionId, swingCount: swing });
      } catch {
        // 保存失敗でも完了画面は見せる（再送は今後の課題）。
      }
      router.replace({
        pathname: "/(shadow-swing)/complete",
        params: { swingCount: String(swing) },
      });
    },
    [completeSession, sessionId, router],
  );

  // 目標到達で自動完了。
  useEffect(() => {
    if (targetCount > 0 && count >= targetCount) {
      void finish(targetCount);
    }
  }, [count, targetCount, finish]);

  const progress = targetCount > 0 ? Math.min(count / targetCount, 1) : 0;
  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  return (
    <View style={styles.container}>
      <Text style={styles.count}>
        {count}
        <Text style={styles.target}> / {targetCount}</Text>
      </Text>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${progress * 100}%` }]} />
      </View>
      <Text style={styles.elapsed}>
        {mm}:{ss}
      </Text>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => setRunning((prev) => !prev)}
        >
          <Text style={styles.secondaryText}>
            {running ? "一時停止" : "再開"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.finishButton}
          onPress={() => finish(count)}
        >
          <Text style={styles.finishText}>終了</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2E2E2E",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  count: { color: "#F4F4F4", fontSize: 72, fontWeight: "800" },
  target: { color: "#A1A1AA", fontSize: 32, fontWeight: "600" },
  barTrack: {
    width: "100%",
    height: 10,
    borderRadius: 5,
    backgroundColor: "#424242",
    marginTop: 24,
    overflow: "hidden",
  },
  barFill: { height: 10, borderRadius: 5, backgroundColor: "#d08000" },
  elapsed: { color: "#A1A1AA", fontSize: 18, marginTop: 20 },
  buttons: { flexDirection: "row", gap: 12, marginTop: 48 },
  secondaryButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    backgroundColor: "#424242",
  },
  secondaryText: { color: "#F4F4F4", fontSize: 16, fontWeight: "700" },
  finishButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    backgroundColor: "#d08000",
  },
  finishText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
});

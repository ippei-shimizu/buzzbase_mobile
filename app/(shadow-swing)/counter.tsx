import { useAudioPlayer, setAudioModeAsync } from "expo-audio";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Speech from "expo-speech";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AppState,
  BackHandler,
  View,
  Text,
  TouchableOpacity,
  Vibration,
  StyleSheet,
} from "react-native";
import {
  Easing,
  cancelAnimation,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { CircularTimer } from "@components/shadow-swing/CircularTimer";
import { useEntitlement } from "@hooks/useEntitlement";
import { useShadowSwingMutations } from "@hooks/useShadowSwing";

export default function ShadowSwingCounterScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    sessionId: string;
    target: string;
    interval: string;
    vibration: string;
    sound: string;
    voice: string;
  }>();
  const { completeSession } = useShadowSwingMutations();
  const { hasEntitlement, isLoading: isProLoading } = useEntitlement();
  // ロード確定前にPro会員が一時停止させられるのを避けるため、setup.tsxの
  // canVibration等と同じくisLoading中は許可側に倒す。
  const canContinueInBackground =
    isProLoading || hasEntitlement("shadow_swing_background");

  const targetCount = Number(params.target) || 0;
  const intervalMs = (Number(params.interval) || 2) * 1000;
  const useVibration = params.vibration === "1";
  const useSound = params.sound === "1";
  const useVoice = params.voice === "1";
  const sessionId = Number(params.sessionId);

  const whistle = useAudioPlayer(require("../../assets/sounds/whistle.wav"));

  const [count, setCount] = useState(0);
  const [running, setRunning] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const runningRef = useRef(running);
  const backgroundedAtRef = useRef<number | null>(null);
  const finishedRef = useRef(false);
  const countRef = useRef(0);

  // 円形タイマーの針。1インターバルで 0→1 を1周する。
  const sweep = useSharedValue(0);
  const startSweep = useCallback(() => {
    sweep.value = 0;
    sweep.value = withTiming(1, {
      duration: intervalMs,
      easing: Easing.linear,
    });
  }, [sweep, intervalMs]);

  // Android の物理戻るボタンをブロックする（gestureEnabled: false と対称）。
  // 完了処理を経ずに離脱するとカウント中のセッションがサーバーに中途半端なまま残るため。
  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => true,
    );
    return () => subscription.remove();
  }, []);

  // マナーモードでも音・読み上げが鳴るようにする（どちらかが有効なら設定）。
  useEffect(() => {
    if (useSound || useVoice)
      void setAudioModeAsync({ playsInSilentMode: true });
  }, [useSound, useVoice]);

  useEffect(() => {
    runningRef.current = running;
  }, [running]);

  // バックグラウンド遷移時の挙動をPro/無料で出し分ける。
  // Pro: バックグラウンドに入っていた実時間を計測し、復帰時に本数・経過時間へ一括反映する
  //     （JSタイマーはOSにより完全停止するため、実際にバックグラウンドで鳴動・カウントし続けるわけではない）。
  // 無料: バックグラウンド遷移で自動的に一時停止する（手動の「再開」ボタンで再開）。
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      // "inactive"はコントロールセンター表示・着信バナー等の一時的な前面状態でJSは止まらないため、
      // ここに含めるとタイマーが動き続けたまま二重にカウントしてしまう。実際にOSがJSを止める
      // "background"だけを対象にする。
      if (nextState === "background") {
        if (!runningRef.current) return;
        if (canContinueInBackground) {
          backgroundedAtRef.current = Date.now();
        } else {
          setRunning(false);
        }
        return;
      }

      if (nextState === "active" && backgroundedAtRef.current !== null) {
        const elapsedMs = Date.now() - backgroundedAtRef.current;
        backgroundedAtRef.current = null;
        const catchUpSwings = Math.floor(elapsedMs / intervalMs);
        if (catchUpSwings > 0) {
          countRef.current += catchUpSwings;
          setCount(countRef.current);
        }
        setElapsed((prev) => prev + Math.round(elapsedMs / 1000));
      }
    });
    return () => subscription.remove();
  }, [canContinueInBackground, intervalMs]);

  // 実行/一時停止に合わせて円形タイマーの針を開始・停止する。
  useEffect(() => {
    if (!running) {
      cancelAnimation(sweep);
      return;
    }
    startSweep();
    return () => cancelAnimation(sweep);
  }, [running, startSweep, sweep]);

  // インターバルごとに自動カウントアップ（＋笛・バイブ・1本ごとの読み上げ・針リセット）。
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      countRef.current += 1;
      const next = countRef.current;
      setCount(next);
      startSweep();
      if (useSound) {
        whistle.seekTo(0);
        whistle.play();
      }
      if (useVibration) Vibration.vibrate(40);
      if (useVoice) {
        // 前の読み上げが残っていても最新の本数に切り替える。
        Speech.stop();
        Speech.speak(String(next), { language: "ja-JP" });
      }
    }, intervalMs);
    return () => clearInterval(id);
  }, [
    running,
    intervalMs,
    useVibration,
    useSound,
    useVoice,
    whistle,
    startSweep,
  ]);

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
      Speech.stop();
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
      <CircularTimer sweep={sweep} count={count} targetCount={targetCount} />
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${progress * 100}%` }]} />
      </View>
      <Text style={styles.elapsed}>
        {mm}:{ss}
      </Text>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => {
            // 一時停止で読み上げが途中でも続いてしまうのを防ぐ。
            if (running) Speech.stop();
            setRunning((prev) => !prev);
          }}
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

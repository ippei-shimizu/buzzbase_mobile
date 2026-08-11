import * as Sentry from "@sentry/react-native";
import { useQueryClient } from "@tanstack/react-query";
import { Stack, useNavigation, useRouter } from "expo-router";
import { useCallback, useEffect, useRef } from "react";
import { TouchableOpacity, Alert } from "react-native";
import { Icon } from "@components/icon/Icon";
import { deleteGameResult } from "@services/gameResultService";
import { isAxios404 } from "@utils/axiosError";
import { invalidateGameResultRelated } from "@utils/queryInvalidation";
import { useBattingRecordStore } from "../../stores/battingRecordStore";
import { useGameRecordStore } from "../../stores/gameRecordStore";

interface BeforeRemoveEvent {
  preventDefault: () => void;
  data: { action: Readonly<{ type: string }> };
}

/**
 * 画面がスタックから取り除かれる直前の beforeRemove を購読する。
 * expo-router の useNavigation の型には stack 固有のイベントが含まれないため、
 * ここでキャストを閉じ込める。
 */
const addBeforeRemoveListener = (
  navigation: ReturnType<typeof useNavigation>,
  listener: (event: BeforeRemoveEvent) => void,
): (() => void) =>
  (
    navigation as unknown as {
      addListener: (
        type: "beforeRemove",
        listener: (event: BeforeRemoveEvent) => void,
      ) => () => void;
    }
  ).addListener("beforeRemove", listener);

export default function GameRecordLayout() {
  const router = useRouter();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const reset = useGameRecordStore((s) => s.reset);
  // 破棄確認を済ませた離脱で beforeRemove がもう一度確認を出さないようにする。
  const isLeavingRef = useRef(false);

  const discardDraft = useCallback(async () => {
    const { gameResultId, isEditMode } = useGameRecordStore.getState();
    // 編集モードでは元々存在していたデータのため削除しない。新規記録モードのみ、
    // Step1送信時点でサーバーに作成済みの未完成ドラフトを削除する。
    if (!isEditMode && gameResultId) {
      try {
        await deleteGameResult(gameResultId);
        invalidateGameResultRelated(queryClient, "refetch");
      } catch (error) {
        if (!isAxios404(error)) {
          Sentry.captureException(error, {
            tags: { source: "game-record-cancel", action: "delete" },
          });
        }
      }
    }
    reset();
    // v2 ステップ式ウィザードの一時状態（打席途中入力）も同時に破棄する。
    useBattingRecordStore.getState().reset();
  }, [queryClient, reset]);

  const confirmDiscard = useCallback(
    (onDiscarded: () => void) => {
      Alert.alert("入力を中断しますか？", "入力中のデータは破棄されます。", [
        { text: "キャンセル", style: "cancel" },
        {
          text: "中断する",
          style: "destructive",
          onPress: async () => {
            await discardDraft();
            isLeavingRef.current = true;
            onDiscarded();
          },
        },
      ]);
    },
    [discardDraft],
  );

  // ×ボタン以外（iOS のエッジスワイプ / Android の物理戻る）の離脱でも
  // サーバー上の未完成ドラフトが残らないようにする。
  useEffect(() => {
    return addBeforeRemoveListener(navigation, (event) => {
      if (isLeavingRef.current) {
        isLeavingRef.current = false;
        return;
      }
      // 記録完了・保存後はストアがリセット済みで破棄対象が無いため確認しない。
      if (useGameRecordStore.getState().gameResultId == null) return;
      event.preventDefault();
      confirmDiscard(() => navigation.dispatch(event.data.action));
    });
  }, [navigation, confirmDiscard]);

  const handleClose = () => confirmDiscard(() => router.back());

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#2E2E2E" },
        headerTintColor: "#F4F4F4",
        headerTitleStyle: { fontSize: 16, fontWeight: "600" },
        contentStyle: { backgroundColor: "#2E2E2E" },
      }}
    >
      <Stack.Screen
        name="step1-game-info"
        options={{
          title: "試合情報",
          headerLeft: () => (
            <TouchableOpacity onPress={handleClose} style={{ padding: 8 }}>
              <Icon name="close" size={24} color="#F4F4F4" />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen name="step2-batting" options={{ title: "打撃成績" }} />
      <Stack.Screen
        name="plate-appearances/index"
        options={{ title: "打席一覧" }}
      />
      <Stack.Screen
        name="plate-appearances/new"
        options={{ title: "打席記録" }}
      />
      <Stack.Screen
        name="plate-appearances/[id]/edit"
        options={{ title: "打席記録" }}
      />
      <Stack.Screen name="step3-pitching" options={{ title: "投手成績" }} />
      <Stack.Screen
        name="summary"
        options={{ title: "サマリー", headerBackVisible: false }}
      />
    </Stack>
  );
}

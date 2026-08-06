import { Ionicons } from "@expo/vector-icons";
import * as Sentry from "@sentry/react-native";
import { useQueryClient } from "@tanstack/react-query";
import { Stack, useRouter } from "expo-router";
import { TouchableOpacity, Alert } from "react-native";
import { deleteGameResult } from "@services/gameResultService";
import { isAxios404 } from "@utils/axiosError";
import { invalidateGameResultRelated } from "@utils/queryInvalidation";
import { useBattingRecordStore } from "../../stores/battingRecordStore";
import { useGameRecordStore } from "../../stores/gameRecordStore";

export default function GameRecordLayout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const reset = useGameRecordStore((s) => s.reset);

  const handleClose = () => {
    Alert.alert("入力を中断しますか？", "入力中のデータは破棄されます。", [
      { text: "キャンセル", style: "cancel" },
      {
        text: "中断する",
        style: "destructive",
        onPress: async () => {
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
          router.back();
        },
      },
    ]);
  };

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
              <Ionicons name="close" size={24} color="#F4F4F4" />
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

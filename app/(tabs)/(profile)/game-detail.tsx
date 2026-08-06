import type { GameResult } from "../../../types/gameResult";
import { Ionicons } from "@expo/vector-icons";
import * as Sentry from "@sentry/react-native";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import React from "react";
import { TouchableOpacity, StyleSheet, Alert, View } from "react-native";
import { GameResultDetail } from "@components/game-results/GameResultDetail";
import { PreReviewPrompt } from "@components/store-review/PreReviewPrompt";
import { useProfile } from "@hooks/useProfile";
import { useReviewPromptModal } from "@hooks/useReviewPromptModal";
import { deleteGameResult } from "@services/gameResultService";
import { useGameRecordStore } from "@stores/gameRecordStore";
import { isAxios404 } from "@utils/axiosError";
import { invalidateGameResultRelated } from "@utils/queryInvalidation";
import { shareGameResult } from "@utils/shareGameResult";

export default function ProfileGameDetailScreen() {
  const { game: gameJson } = useLocalSearchParams<{ game: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { profile } = useProfile();
  const loadFromGameResult = useGameRecordStore((s) => s.loadFromGameResult);
  const { triggerPositiveEvent, modalProps } = useReviewPromptModal();

  if (!gameJson) {
    return null;
  }

  let game: GameResult;
  try {
    game = JSON.parse(gameJson);
  } catch {
    return null;
  }

  const isOwner = profile?.id === game.user_id;

  const handleShare = async () => {
    const result = await shareGameResult(game);
    if (result.shared) await triggerPositiveEvent();
  };

  const handleEdit = () => {
    loadFromGameResult(game);
    router.push("/(game-record)/step1-game-info");
  };

  const handleDelete = async () => {
    try {
      await deleteGameResult(game.game_result_id);
    } catch (error) {
      // 404 は既に削除済みなので成功扱い（クライアント側のキャッシュやナビゲーション
      // パラメータに古い id が残るケースで 404 連打ループを起こさないため）。
      if (!isAxios404(error)) {
        Sentry.captureException(error, {
          tags: { source: "profile-game-detail", action: "delete" },
        });
        Alert.alert("エラー", "試合結果の削除に失敗しました");
        return;
      }
    }
    invalidateGameResultRelated(queryClient, "refetch");
    router.back();
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "試合詳細",
          headerRight: () => (
            <View style={styles.headerRight}>
              {isOwner && (
                <TouchableOpacity
                  onPress={handleEdit}
                  style={styles.headerButton}
                >
                  <Ionicons name="create-outline" size={22} color="#F4F4F4" />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={handleShare}
                style={styles.headerButton}
              >
                <Ionicons name="share-outline" size={22} color="#F4F4F4" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <GameResultDetail
        game={game}
        onDelete={isOwner ? handleDelete : undefined}
      />
      <PreReviewPrompt {...modalProps} />
    </>
  );
}

const styles = StyleSheet.create({
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  headerButton: {
    padding: 8,
  },
});

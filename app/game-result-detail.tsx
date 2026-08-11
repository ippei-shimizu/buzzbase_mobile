import type { GameResult } from "../types/gameResult";
import * as Sentry from "@sentry/react-native";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import React from "react";
import { TouchableOpacity, StyleSheet, Alert, View } from "react-native";
import { GameResultDetail } from "@components/game-results/GameResultDetail";
import { Icon } from "@components/icon/Icon";
import { PreReviewPrompt } from "@components/store-review/PreReviewPrompt";
import { useProfile } from "@hooks/useProfile";
import { useReviewPromptModal } from "@hooks/useReviewPromptModal";
import { deleteGameResult } from "@services/gameResultService";
import { isAxios404 } from "@utils/axiosError";
import { invalidateGameResultRelated } from "@utils/queryInvalidation";
import { shareGameResult } from "@utils/shareGameResult";
import { useGameRecordStore } from "../stores/gameRecordStore";

export default function GameResultDetailModal() {
  const { game: gameJson } = useLocalSearchParams<{ game: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { profile } = useProfile();
  const loadFromGameResult = useGameRecordStore((s) => s.loadFromGameResult);
  const { triggerPositiveEvent, modalProps } = useReviewPromptModal();

  if (!gameJson) {
    return null;
  }

  const game: GameResult = JSON.parse(gameJson);
  const isOwner = profile?.id === game.user_id;

  const handleShare = async () => {
    const result = await shareGameResult(game);
    if (result.shared) await triggerPositiveEvent();
  };

  const handleEdit = () => {
    const gameWithUserId = game.user_id
      ? game
      : { ...game, user_id: profile?.id ?? 0 };
    loadFromGameResult(gameWithUserId);
    router.push("/(game-record)/step1-game-info");
  };

  const performDelete = async () => {
    try {
      await deleteGameResult(game.game_result_id);
    } catch (error) {
      // 404 は既に削除済みなので成功扱い（クライアント側のキャッシュやナビゲーション
      // パラメータに古い id が残るケースで 404 連打ループを起こさないため）。
      if (!isAxios404(error)) {
        Sentry.captureException(error, {
          tags: { source: "game-result-detail", action: "delete" },
        });
        Alert.alert("エラー", "試合結果の削除に失敗しました");
        return;
      }
    }
    // 戻り先（ホームタブのダッシュボード等）は useFocusEffect を持たないため、
    // 削除を即座にUIへ反映するよう active refetch を発火させる。
    invalidateGameResultRelated(queryClient, "refetch");
    router.back();
  };

  const handleDelete = () => {
    Alert.alert("試合結果の削除", "この試合結果を削除しますか？", [
      { text: "キャンセル", style: "cancel" },
      { text: "削除", style: "destructive", onPress: performDelete },
    ]);
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
                  <Icon name="create-outline" size={22} color="#F4F4F4" />
                </TouchableOpacity>
              )}
              {isOwner && (
                <TouchableOpacity
                  onPress={handleDelete}
                  style={styles.headerButton}
                >
                  <Icon name="trash-outline" size={22} color="#F31260" />
                </TouchableOpacity>
              )}
            </View>
          ),
        }}
      />
      <GameResultDetail
        game={game}
        onEdit={isOwner ? handleEdit : undefined}
        onShare={handleShare}
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

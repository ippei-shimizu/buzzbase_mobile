import React from "react";
import { TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { GameResultDetail } from "@components/game-results/GameResultDetail";
import { deleteGameResult } from "@services/gameResultService";
import { shareGameResult } from "@utils/shareGameResult";
import type { GameResult } from "../../../types/gameResult";

export default function GameResultDetailScreen() {
  const { game: gameJson } = useLocalSearchParams<{ game: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  if (!gameJson) {
    return null;
  }

  const game: GameResult = JSON.parse(gameJson);

  const handleShare = () => {
    shareGameResult(game);
  };

  const handleDelete = async () => {
    try {
      await deleteGameResult(game.game_result_id);
      queryClient.invalidateQueries({ queryKey: ["gameResults"] });
      router.back();
    } catch {
      Alert.alert("エラー", "試合結果の削除に失敗しました");
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
              <Ionicons name="share-outline" size={22} color="#F4F4F4" />
            </TouchableOpacity>
          ),
        }}
      />
      <GameResultDetail game={game} onDelete={handleDelete} />
    </>
  );
}

const styles = StyleSheet.create({
  shareButton: {
    padding: 8,
  },
});

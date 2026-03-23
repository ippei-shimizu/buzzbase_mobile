import React from "react";
import { TouchableOpacity, StyleSheet, Alert, View } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { GameResultDetail } from "@components/game-results/GameResultDetail";
import { deleteGameResult } from "@services/gameResultService";
import { shareGameResult } from "@utils/shareGameResult";
import { useProfile } from "@hooks/useProfile";
import { useGameRecordStore } from "../../../stores/gameRecordStore";
import type { GameResult } from "../../../types/gameResult";

export default function GameResultDetailScreen() {
  const { game: gameJson } = useLocalSearchParams<{ game: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { profile } = useProfile();
  const loadFromGameResult = useGameRecordStore((s) => s.loadFromGameResult);

  if (!gameJson) {
    return null;
  }

  const game: GameResult = JSON.parse(gameJson);
  const isOwner = profile?.id === game.user_id;

  const handleShare = () => {
    shareGameResult(game);
  };

  const handleEdit = () => {
    const gameWithUserId = game.user_id
      ? game
      : { ...game, user_id: profile?.id ?? 0 };
    loadFromGameResult(gameWithUserId);
    router.push("/(game-record)/step1-game-info");
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
      <GameResultDetail game={game} onDelete={isOwner ? handleDelete : undefined} />
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

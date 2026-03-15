import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { GameResultDetail } from "@components/game-results/GameResultDetail";
import { shareGameResult } from "@utils/shareGameResult";
import type { GameResult } from "../../../types/gameResult";

export default function GameResultDetailScreen() {
  const { game: gameJson } = useLocalSearchParams<{ game: string }>();
  const game: GameResult = JSON.parse(gameJson);

  const handleShare = () => {
    shareGameResult(game);
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
      <GameResultDetail game={game} />
    </>
  );
}

const styles = StyleSheet.create({
  shareButton: {
    padding: 8,
  },
});

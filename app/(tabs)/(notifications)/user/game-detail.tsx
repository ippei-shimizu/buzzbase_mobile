import type { GameResult } from "../../../../types/gameResult";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, Stack } from "expo-router";
import React from "react";
import { TouchableOpacity, StyleSheet, View } from "react-native";
import { GameResultDetail } from "@components/game-results/GameResultDetail";
import { shareGameResult } from "@utils/shareGameResult";

export default function NotificationGameDetailScreen() {
  const { game: gameJson } = useLocalSearchParams<{ game: string }>();

  if (!gameJson) {
    return null;
  }

  const game: GameResult = JSON.parse(gameJson);

  const handleShare = () => {
    shareGameResult(game);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "試合詳細",
          headerRight: () => (
            <View style={styles.headerRight}>
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
      <GameResultDetail game={game} />
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

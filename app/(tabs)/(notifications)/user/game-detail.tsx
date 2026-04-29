import type { GameResult } from "../../../../types/gameResult";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, Stack } from "expo-router";
import React from "react";
import { TouchableOpacity, StyleSheet, View } from "react-native";
import { GameResultDetail } from "@components/game-results/GameResultDetail";
import { PreReviewPrompt } from "@components/store-review/PreReviewPrompt";
import { useReviewPromptModal } from "@hooks/useReviewPromptModal";
import { shareGameResult } from "@utils/shareGameResult";

export default function NotificationGameDetailScreen() {
  const { game: gameJson } = useLocalSearchParams<{ game: string }>();
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

  const handleShare = async () => {
    const result = await shareGameResult(game);
    if (result.shared) await triggerPositiveEvent();
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

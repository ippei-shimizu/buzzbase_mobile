import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useGameResults } from "@hooks/useGameResults";
import { GameResultList } from "../game-results/GameResultList";
import type { GameResult } from "../../types/gameResult";

export const ProfileGamesTab = () => {
  const router = useRouter();
  const {
    gameResults,
    isLoading,
    isRefreshing,
    refetch,
    fetchNextPage,
    isFetchingNextPage,
  } = useGameResults();

  const handlePressItem = (game: GameResult) => {
    router.push({
      pathname: "/(game-results)/[id]",
      params: { id: game.game_result_id, game: JSON.stringify(game) },
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#d08000" />
      </View>
    );
  }

  return (
    <GameResultList
      data={gameResults}
      isRefreshing={isRefreshing}
      onRefresh={refetch}
      onEndReached={() => fetchNextPage()}
      isFetchingNextPage={isFetchingNextPage}
      onPressItem={handlePressItem}
    />
  );
};

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 40,
  },
});

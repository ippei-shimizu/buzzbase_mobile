import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useGameResults } from "@hooks/useGameResults";
import { GameResultList } from "@components/game-results/GameResultList";
import type { GameResult } from "../../../types/gameResult";

export default function GameResultsScreen() {
  const {
    gameResults,
    isLoading,
    isError,
    refetch,
    isRefreshing,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGameResults();
  const router = useRouter();

  const handlePressItem = (game: GameResult) => {
    router.push({
      pathname: "/(game-results)/[id]",
      params: {
        id: game.game_result_id,
        game: JSON.stringify(game),
      },
    });
  };

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#d08000" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>データの取得に失敗しました</Text>
      </View>
    );
  }

  return (
    <GameResultList
      data={gameResults}
      isRefreshing={isRefreshing}
      onRefresh={refetch}
      onEndReached={handleEndReached}
      isFetchingNextPage={isFetchingNextPage}
      onPressItem={handlePressItem}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#A1A1AA",
    fontSize: 16,
  },
});

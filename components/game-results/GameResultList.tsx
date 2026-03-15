import React from "react";
import {
  FlatList,
  RefreshControl,
  ActivityIndicator,
  View,
  StyleSheet,
} from "react-native";
import type { GameResult } from "../../types/gameResult";
import { GameResultListItem } from "./GameResultListItem";
import { EmptyState } from "../dashboard/EmptyState";

interface GameResultListProps {
  data: GameResult[];
  isRefreshing: boolean;
  onRefresh: () => void;
  onEndReached: () => void;
  isFetchingNextPage: boolean;
  onPressItem: (game: GameResult) => void;
}

export const GameResultList = ({
  data,
  isRefreshing,
  onRefresh,
  onEndReached,
  isFetchingNextPage,
  onPressItem,
}: GameResultListProps) => {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => String(item.game_result_id)}
      renderItem={({ item }) => (
        <GameResultListItem game={item} onPress={onPressItem} />
      )}
      contentContainerStyle={styles.content}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor="#d08000"
        />
      }
      ListFooterComponent={
        isFetchingNextPage ? (
          <View style={styles.footer}>
            <ActivityIndicator color="#d08000" />
          </View>
        ) : null
      }
      ListEmptyComponent={
        <EmptyState
          title="試合結果がありません"
          subtitle="試合結果を記録すると、ここに表示されます"
        />
      }
    />
  );
};

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 32,
    flexGrow: 1,
  },
  footer: {
    paddingVertical: 16,
    alignItems: "center",
  },
});

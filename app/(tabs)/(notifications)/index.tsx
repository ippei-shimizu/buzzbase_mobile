import React, { useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import {
  useManagementNotices,
  useMarkNoticesRead,
} from "@hooks/useNotifications";
import { NoticeCard } from "@components/notifications/NoticeCard";

export default function NotificationsScreen() {
  const router = useRouter();
  const { notices, isLoading, isError, refetch, isRefreshing } =
    useManagementNotices();
  const { mutate: markRead } = useMarkNoticesRead();

  useFocusEffect(
    useCallback(() => {
      markRead();
    }, [markRead]),
  );

  const handlePress = (id: number) => {
    router.push(`/(notifications)/${id}`);
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#d08000" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>データの取得に失敗しました</Text>
        <Text style={styles.retryText} onPress={() => refetch()}>
          タップして再試行
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={notices}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <NoticeCard notice={item} onPress={handlePress} />
      )}
      contentContainerStyle={styles.list}
      refreshing={isRefreshing}
      onRefresh={refetch}
      ListEmptyComponent={
        <View style={styles.centered}>
          <Text style={styles.emptyText}>お知らせはありません</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2E2E2E",
  },
  list: {
    padding: 16,
    flexGrow: 1,
  },
  errorText: {
    color: "#A1A1AA",
    fontSize: 16,
    marginBottom: 12,
  },
  retryText: {
    color: "#d08000",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyText: {
    color: "#A1A1AA",
    fontSize: 16,
  },
});

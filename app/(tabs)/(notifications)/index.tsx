import type {
  NotificationItem,
  UserNotification,
  ManagementNotification,
} from "../../../types/notification";
import { useRouter, useFocusEffect } from "expo-router";
import React, { useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { NotificationItemComponent } from "@components/notifications/NotificationItem";
import {
  useNotifications,
  useMarkNoticesRead,
  useMarkNotificationRead,
} from "@hooks/useNotifications";
import { useProfile } from "@hooks/useProfile";

export default function NotificationsScreen() {
  const router = useRouter();
  const { profile } = useProfile();
  const { notifications, isLoading, isError, refetch, isRefreshing } =
    useNotifications(profile?.user_id ?? undefined);
  const { mutate: markRead } = useMarkNoticesRead();
  const { mutate: markNotificationRead } = useMarkNotificationRead();

  useFocusEffect(
    useCallback(() => {
      markRead();
    }, [markRead]),
  );

  const handlePress = (notification: NotificationItem) => {
    if (notification.event_type === "management_notice") {
      const mn = notification as ManagementNotification;
      router.push(`/(notifications)/${mn.management_notice_id}`);
    } else {
      const un = notification as UserNotification;
      if (un.read_at === null) {
        markNotificationRead(un.id);
      }
      router.push(`/(profile)/${un.actor_user_id}`);
    }
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
      data={notifications}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => (
        <NotificationItemComponent notification={item} onPress={handlePress} />
      )}
      contentContainerStyle={styles.list}
      refreshing={isRefreshing}
      onRefresh={refetch}
      ListEmptyComponent={
        <View style={styles.centered}>
          <Text style={styles.emptyText}>通知はありません</Text>
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
    flexGrow: 1,
    backgroundColor: "#2E2E2E",
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

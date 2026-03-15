import React from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useManagementNotice } from "@hooks/useNotifications";

export default function NoticeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { notice, isLoading, isError, refetch } = useManagementNotice(
    id ? Number(id) : undefined,
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#d08000" />
      </View>
    );
  }

  if (isError || !notice) {
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{notice.title}</Text>
      <Text style={styles.date}>{notice.published_at}</Text>
      <Text style={styles.body}>{notice.body}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2E2E2E",
  },
  content: {
    padding: 20,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2E2E2E",
  },
  title: {
    color: "#F4F4F4",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  date: {
    color: "#A1A1AA",
    fontSize: 14,
    marginBottom: 20,
  },
  body: {
    color: "#D4D4D8",
    fontSize: 15,
    lineHeight: 24,
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
});

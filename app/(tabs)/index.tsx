import React from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDashboard } from "@hooks/useDashboard";
import { DashboardContent } from "@components/dashboard/DashboardContent";

export default function HomeScreen() {
  const { data, isLoading, isError, refetch, isRefreshing } = useDashboard();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#d08000" />
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !data) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>データの取得に失敗しました</Text>
          <Text style={styles.retryText} onPress={() => refetch()}>
            タップして再試行
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <DashboardContent
        data={data}
        isRefreshing={isRefreshing}
        onRefresh={refetch}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2E2E2E",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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

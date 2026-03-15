import React, { useLayoutEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import { useDashboard } from "@hooks/useDashboard";
import { useNotificationCount } from "@hooks/useNotifications";
import { DashboardContent } from "@components/dashboard/DashboardContent";
import { NotificationBell } from "@components/dashboard/NotificationBell";

export default function HomeScreen() {
  const router = useRouter();
  const { data, isLoading, isError, refetch, isRefreshing } = useDashboard();
  const { count } = useNotificationCount();
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <NotificationBell
          count={count}
          onPress={() => router.push("/(notifications)")}
        />
      ),
    });
  }, [navigation, count, router]);

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
      <TouchableOpacity
        style={styles.recordButton}
        onPress={() => router.push("/(game-record)/step1-game-info")}
      >
        <Text style={styles.recordButtonText}>試合結果を記録</Text>
      </TouchableOpacity>
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
  recordButton: {
    position: "absolute",
    bottom: 24,
    left: 20,
    right: 20,
    backgroundColor: "#d08000",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  recordButtonText: {
    color: "#F4F4F4",
    fontSize: 16,
    fontWeight: "bold",
  },
});

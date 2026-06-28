import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { DashboardContent } from "@components/dashboard/DashboardContent";
import { PreReviewPrompt } from "@components/store-review/PreReviewPrompt";
import { useDashboard } from "@hooks/useDashboard";
import { useReviewPromptModal } from "@hooks/useReviewPromptModal";
import { useGameRecordStore } from "@stores/gameRecordStore";

/**
 * ホーム > 「ダッシュボード」面。今月の成績サマリ・最近の試合・グループランキングを表示する。
 * 旧 `app/(tabs)/index.tsx` のダッシュボード描画をそのまま切り出したもの。
 */
export function DashboardView() {
  const router = useRouter();
  const { data, isLoading, isError, refetch, isRefreshing } = useDashboard();
  const { triggerPositiveEvent, modalProps } = useReviewPromptModal();

  useEffect(() => {
    if (!data) return;
    const inTopThree = data.group_rankings.some((group) =>
      [...group.batting_rankings, ...group.pitching_rankings].some(
        (entry) =>
          entry.current_rank !== null &&
          entry.current_rank >= 1 &&
          entry.current_rank <= 3,
      ),
    );
    if (inTopThree) {
      triggerPositiveEvent("dashboard-ranking-top3");
    }
  }, [data, triggerPositiveEvent]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#d08000" />
      </View>
    );
  }

  if (isError || !data) {
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
    <>
      <DashboardContent
        data={data}
        isRefreshing={isRefreshing}
        onRefresh={refetch}
        headerComponent={
          <TouchableOpacity
            style={styles.recordButton}
            onPress={() => {
              // 直前の編集モードフラグが残っていると Step1 が編集モードのまま起動するため、
              // 新規記録の入口では store を必ず初期化する。
              useGameRecordStore.getState().reset();
              router.push("/(game-record)/step1-game-info");
            }}
          >
            <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
            <Text style={styles.recordButtonText}>試合結果を記録する</Text>
          </TouchableOpacity>
        }
      />
      <PreReviewPrompt {...modalProps} />
    </>
  );
}

const styles = StyleSheet.create({
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#d08000",
    borderRadius: 8,
    paddingVertical: 12,
    marginBottom: 12,
  },
  recordButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});

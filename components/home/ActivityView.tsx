import { useQueryClient } from "@tanstack/react-query";
import React, { useCallback, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet } from "react-native";
import { PracticeToolsSection } from "./sections/PracticeToolsSection";
import { RecentPracticeSection } from "./sections/RecentPracticeSection";
import { RecordButtonsSection } from "./sections/RecordButtonsSection";
import { StreakHeaderSection } from "./sections/StreakHeaderSection";
import { TodayGoalSection } from "./sections/TodayGoalSection";
import { TodayTasksSection } from "./sections/TodayTasksSection";

/**
 * ホーム > 「練習・活動」面（継続ループの司令塔）。
 * 記録動線を最上段に置き、以降「続けたくなる → 今日やる → 進捗 → 振り返り」と積む。
 * 各セクションの実体は対応する Pro 機能 PR で差し込む。
 */
// 子セクションが個別に持つ TanStack Query をまとめて再取得するための queryKey 先頭一致リスト。
// params 付き queryKey（activityLogs / practiceLogs / notesV2）も先頭一致で拾えるよう predicate で判定する。
const REFRESH_QUERY_KEYS = [
  "practiceMenus",
  "streak",
  "activityLogs",
  "schedules",
  "goals",
  "practiceLogs",
  "practiceSessions",
  "notesV2",
];

export function ActivityView() {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await queryClient.refetchQueries({
        predicate: (query) =>
          REFRESH_QUERY_KEYS.includes(query.queryKey[0] as string),
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor="#d08000"
        />
      }
    >
      <RecordButtonsSection />
      <StreakHeaderSection />
      <TodayTasksSection />
      <PracticeToolsSection />
      <TodayGoalSection />
      <RecentPracticeSection />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
});

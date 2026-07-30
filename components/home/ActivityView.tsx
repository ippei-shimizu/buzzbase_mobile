import { useQueryClient } from "@tanstack/react-query";
import React, { useCallback, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { InlineBannerAd } from "@components/ads/InlineBannerAd";
import { BackToTopButton } from "@components/ui/BackToTopButton";
import { useBackToTop } from "@hooks/useBackToTop";
import { CurrentThemeSection } from "./sections/CurrentThemeSection";
import { ImprovementToolsSection } from "./sections/ImprovementToolsSection";
import { MonthlySummarySection } from "./sections/MonthlySummarySection";
import { PeriodicReviewBanner } from "./sections/PeriodicReviewBanner";
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
  "shadowSwingStats",
  "activityLogs",
  "schedules",
  "plans",
  "goals",
  "practiceLogs",
  "practiceSessions",
  "practiceSummaries",
  "notesV2",
  "improvementThemes",
  "periodicReviews",
];

export function ActivityView() {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { scrollRef, showBackToTop, handleScroll, scrollToTop } =
    useBackToTop();

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
    <View style={styles.wrapper}>
      <ScrollView
        ref={scrollRef}
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={64}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor="#d08000"
          />
        }
      >
        {/* 提案A: 記録 → 今日 → 継続（報酬）→ 振り返り → ツール → 積み上げ の順。 */}
        <RecordButtonsSection />
        <TodayTasksSection />
        <CurrentThemeSection />
        <TodayGoalSection />
        <StreakHeaderSection />
        <PeriodicReviewBanner />
        <PracticeToolsSection />
        <ImprovementToolsSection />
        <MonthlySummarySection />
        <RecentPracticeSection />
        <InlineBannerAd placement="home" />
      </ScrollView>
      <BackToTopButton visible={showBackToTop} onPress={scrollToTop} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
});

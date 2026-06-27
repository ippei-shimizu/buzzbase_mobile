import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { QuickRecordSection } from "./sections/QuickRecordSection";
import { RecentPracticeSection } from "./sections/RecentPracticeSection";
import { StreakHeaderSection } from "./sections/StreakHeaderSection";
import { TodayGoalSection } from "./sections/TodayGoalSection";
import { TodayTasksSection } from "./sections/TodayTasksSection";

/**
 * ホーム > 「活動」面（継続ループの司令塔）。
 * 上から「続けたくなる → 今日やる → 記録する → 進捗 → 振り返り」の順に積む。
 * 各セクションの実体は対応する Pro 機能 PR で差し込む。
 */
export function ActivityView() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <StreakHeaderSection />
      <TodayTasksSection />
      <QuickRecordSection />
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

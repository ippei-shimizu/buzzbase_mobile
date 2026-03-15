import React from "react";
import {
  ScrollView,
  RefreshControl,
  StyleSheet,
  type ViewStyle,
} from "react-native";
import type { DashboardData } from "../../types/dashboard";
import { StatsOverview } from "./StatsOverview";
import { RecentGameResults } from "./RecentGameResults";
import { GroupRankings } from "./GroupRankings";

interface DashboardContentProps {
  data: DashboardData;
  isRefreshing: boolean;
  onRefresh: () => void;
  style?: ViewStyle;
}

export const DashboardContent = ({
  data,
  isRefreshing,
  onRefresh,
  style,
}: DashboardContentProps) => {
  return (
    <ScrollView
      style={[styles.container, style]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor="#d08000"
        />
      }
    >
      <StatsOverview
        battingStats={data.batting_stats}
        pitchingStats={data.pitching_stats}
      />
      <RecentGameResults
        results={data.recent_game_results}
        style={styles.section}
      />
      <GroupRankings rankings={data.group_rankings} style={styles.section} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginTop: 8,
  },
});

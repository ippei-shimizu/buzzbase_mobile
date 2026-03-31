import type { DashboardData } from "../../types/dashboard";
import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  RefreshControl,
  StyleSheet,
  type ViewStyle,
} from "react-native";
import { GroupRankings } from "./GroupRankings";
import { RecentGameResults } from "./RecentGameResults";
import { StatsOverview } from "./StatsOverview";

interface DashboardContentProps {
  data: DashboardData;
  isRefreshing: boolean;
  onRefresh: () => void;
  style?: ViewStyle;
  headerComponent?: React.ReactNode;
}

export const DashboardContent = ({
  data,
  isRefreshing,
  onRefresh,
  style,
  headerComponent,
}: DashboardContentProps) => {
  const router = useRouter();

  const handleGroupPress = (groupId: number) => {
    router.push(`/(groups)/${groupId}`);
  };

  const handleShowAll = () => {
    router.push("/(groups)");
  };

  const handleCreateGroup = () => {
    router.push("/(groups)/create");
  };

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
      {headerComponent}
      <StatsOverview
        battingStats={data.batting_stats}
        pitchingStats={data.pitching_stats}
      />
      <RecentGameResults
        results={data.recent_game_results}
        style={styles.section}
      />
      <GroupRankings
        rankings={data.group_rankings}
        style={styles.section}
        onGroupPress={handleGroupPress}
        onShowAll={handleShowAll}
        onCreateGroup={handleCreateGroup}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 0,
  },
  section: {
    marginTop: 24,
  },
});

import type { DashboardData } from "../../types/dashboard";
import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  RefreshControl,
  StyleSheet,
  type ViewStyle,
} from "react-native";
import { useProfile } from "@hooks/useProfile";
import { GroupRankings } from "./GroupRankings";
import { RecentGameResults } from "./RecentGameResults";
import { StatsOverview } from "./StatsOverview";
import { WelcomeCard } from "./WelcomeCard";

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
  const { profile } = useProfile();

  const isNewUser =
    data.recent_game_results.length === 0 &&
    data.batting_stats.aggregate === null;

  const handleGroupPress = (groupId: number) => {
    router.push({ pathname: "/group-detail", params: { id: groupId } });
  };

  const handleShowAll = () => {
    router.push("/(groups)");
  };

  const handleCreateGroup = () => {
    router.push("/(groups)/create");
  };

  const handleRecordGame = () => {
    router.push("/(game-record)/step1-game-info");
  };

  const handleInviteFriends = () => {
    router.push(
      profile?.user_id ? "/(groups)/create" : "/(auth)/username-registration",
    );
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
      {isNewUser ? (
        <WelcomeCard
          onRecordGame={handleRecordGame}
          onInviteFriends={handleInviteFriends}
          style={styles.welcomeCard}
        />
      ) : (
        headerComponent
      )}
      <StatsOverview
        battingStats={data.batting_stats}
        pitchingStats={data.pitching_stats}
        onRecordGame={handleRecordGame}
      />
      <RecentGameResults
        results={data.recent_game_results}
        style={styles.section}
        onRecordGame={handleRecordGame}
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
  welcomeCard: {
    marginBottom: 24,
  },
});

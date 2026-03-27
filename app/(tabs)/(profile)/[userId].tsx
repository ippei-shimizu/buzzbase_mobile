import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ProfileHeader } from "@components/profile/ProfileHeader";
import { ProfileStatsTab } from "@components/profile/ProfileStatsTab";
import { GameResultListItem } from "@components/game-results/GameResultListItem";
import {
  useUserProfileDetail,
  useFollowUser,
  useUnfollowUser,
} from "@hooks/useRelationship";
import {
  useTeams,
  usePrefectures,
  useBaseballCategories,
} from "@hooks/useMasterData";
import { useUserAwards } from "@hooks/useAwards";
import { useUserStats } from "@hooks/useProfileStats";
import { useUserGameResults } from "@hooks/useGameResults";
import type { StatsFilters } from "../../../types/profile";
import type { GameResult } from "../../../types/gameResult";

export default function UserProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);

  const { data, isLoading, refetch, isRefreshing } =
    useUserProfileDetail(userId);
  const { followUser, isFollowing } = useFollowUser();
  const { unfollowUser, isUnfollowing } = useUnfollowUser();

  const { data: teams } = useTeams();
  const { data: prefectures } = usePrefectures();
  const { data: categories } = useBaseballCategories();
  const { data: awards } = useUserAwards(data?.user.id);

  const team = teams?.find((t) => t.id === data?.user.team_id);
  const categoryName = categories?.find(
    (c) => c.id === team?.category_id,
  )?.name;
  const prefectureName = prefectures?.find(
    (p) => p.id === team?.prefecture_id,
  )?.name;

  // 成績フィルター
  const filters: StatsFilters = {};
  const {
    battingStats,
    pitchingStats,
    isLoading: isStatsLoading,
    refetch: refetchStats,
    isRefreshing: isStatsRefreshing,
  } = useUserStats(data?.user.id, filters);

  // 試合結果
  const {
    gameResults,
    isLoading: isGamesLoading,
    isRefreshing: isGamesRefreshing,
    refetch: refetchGames,
  } = useUserGameResults(data?.user.id);

  const isPrivateAndNotFollowing =
    data?.is_private &&
    data.follow_status !== "following" &&
    data.follow_status !== "self";

  const canViewContent = !isPrivateAndNotFollowing;

  const handleFollowPress = async () => {
    if (!data) return;
    if (
      data.follow_status === "following" ||
      data.follow_status === "pending"
    ) {
      await unfollowUser(data.user.id);
    } else if (data.follow_status === "none") {
      await followUser(data.user.id);
    }
  };

  const handleRefresh = () => {
    refetch();
    if (canViewContent) {
      refetchStats();
      refetchGames();
    }
  };

  const handlePressGame = (game: GameResult) => {
    router.push({
      pathname: "/(game-results)/[id]",
      params: {
        id: game.game_result_id,
        game: JSON.stringify(game),
      },
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#d08000" />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>ユーザーが見つかりません</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 16 }}
      bounces
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing || isStatsRefreshing || isGamesRefreshing}
          onRefresh={handleRefresh}
          tintColor="#d08000"
        />
      }
    >
      {/* index 0: ProfileHeader */}
      <View>
        <ProfileHeader
          profile={data.user}
          followingCount={data.following_count ?? 0}
          followersCount={data.followers_count ?? 0}
          followStatus={data.follow_status}
          onFollowPress={handleFollowPress}
          onFollowingCountPress={() => {
            router.push({
              pathname: "/(profile)/follows",
              params: { id: String(data.user.id), tab: "following" },
            });
          }}
          onFollowersCountPress={() => {
            router.push({
              pathname: "/(profile)/follows",
              params: { id: String(data.user.id), tab: "followers" },
            });
          }}
          isFollowLoading={isFollowing || isUnfollowing}
          positions={data.user.positions}
          teamName={team?.name}
          categoryName={categoryName}
          prefectureName={prefectureName}
          awards={awards}
        />
      </View>

      {isPrivateAndNotFollowing ? (
        <View style={styles.privateContainer}>
          <Ionicons name="lock-closed" size={32} color="#71717A" />
          <Text style={styles.privateText}>このアカウントは非公開です</Text>
          <Text style={styles.privateSubText}>
            フォローが承認されると成績や試合結果を閲覧できます
          </Text>
        </View>
      ) : (
        <>
          {/* index 1: タブバー（sticky） */}
          <View
            style={{
              backgroundColor: "#2E2E2E",
              paddingHorizontal: 16,
              paddingVertical: 10,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                backgroundColor: "#27272a",
                borderRadius: 8,
                padding: 4,
              }}
            >
              <TouchableOpacity
                style={[
                  styles.tabPill,
                  activeTab === 0
                    ? styles.tabPillActive
                    : styles.tabPillInactive,
                ]}
                onPress={() => setActiveTab(0)}
              >
                <Text
                  style={[
                    styles.tabPillText,
                    activeTab === 0 && styles.tabPillTextActive,
                  ]}
                >
                  成績
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tabPill,
                  activeTab === 1
                    ? styles.tabPillActive
                    : styles.tabPillInactive,
                ]}
                onPress={() => setActiveTab(1)}
              >
                <Text
                  style={[
                    styles.tabPillText,
                    activeTab === 1 && styles.tabPillTextActive,
                  ]}
                >
                  試合
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* コンテンツ */}
          <View style={styles.contentContainer}>
            {activeTab === 0 ? (
              isStatsLoading ? (
                <ActivityIndicator color="#d08000" style={{ marginTop: 20 }} />
              ) : (
                <ProfileStatsTab
                  battingStats={battingStats}
                  pitchingStats={pitchingStats}
                />
              )
            ) : (
              <View style={styles.gamesContainer}>
                {isGamesLoading ? (
                  <ActivityIndicator
                    color="#d08000"
                    style={{ marginTop: 40 }}
                  />
                ) : gameResults.length === 0 ? (
                  <Text style={styles.emptyText}>試合記録がありません</Text>
                ) : (
                  gameResults.map((item) => (
                    <GameResultListItem
                      key={item.game_result_id}
                      game={item}
                      onPress={handlePressGame}
                    />
                  ))
                )}
              </View>
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2E2E2E",
  },
  container: {
    flex: 1,
    backgroundColor: "#2E2E2E",
  },
  errorText: {
    color: "#A1A1AA",
    fontSize: 16,
  },
  privateContainer: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 32,
    gap: 8,
  },
  privateText: {
    color: "#A1A1AA",
    fontSize: 16,
    fontWeight: "600",
  },
  privateSubText: {
    color: "#71717A",
    fontSize: 13,
    textAlign: "center",
  },
  tabPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  tabPillActive: {
    backgroundColor: "#d08000",
  },
  tabPillInactive: {
    backgroundColor: "transparent",
  },
  tabPillText: {
    color: "#A1A1AA",
    fontSize: 14,
    fontWeight: "600",
  },
  tabPillTextActive: {
    color: "#FFFFFF",
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  gamesContainer: {
    backgroundColor: "#27272a",
    borderRadius: 12,
    padding: 16,
  },
  emptyText: {
    color: "#A1A1AA",
    fontSize: 14,
    textAlign: "center",
    marginTop: 40,
    marginBottom: 40,
    width: "100%",
  },
});

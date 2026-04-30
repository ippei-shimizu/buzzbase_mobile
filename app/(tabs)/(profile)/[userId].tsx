import type { GameResult } from "../../../types/gameResult";
import type { StatsFilters } from "../../../types/profile";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { GamePagination } from "@components/game-results/GamePagination";
import { GameResultListItem } from "@components/game-results/GameResultListItem";
import {
  FilterDropdown,
  MATCH_TYPE_OPTIONS,
} from "@components/profile/FilterDropdown";
import { FollowRequestBanner } from "@components/profile/FollowRequestBanner";
import { ProfileHeader } from "@components/profile/ProfileHeader";
import { ProfileStatsTab } from "@components/profile/ProfileStatsTab";
import { useUserAwards } from "@hooks/useAwards";
import { useFilteredUserGameResults } from "@hooks/useGameResults";
import {
  useTeams,
  usePrefectures,
  useBaseballCategories,
} from "@hooks/useMasterData";
import { useUserStats } from "@hooks/useProfileStats";
import {
  useUserProfileDetail,
  useFollowUser,
  useUnfollowUser,
} from "@hooks/useRelationship";
import { useSeasons } from "@hooks/useSeasons";
import { useTournaments } from "@hooks/useTournaments";

export default function UserProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
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
  const [selectedYear, setSelectedYear] = useState<string | undefined>(
    undefined,
  );
  const [selectedMatchType, setSelectedMatchType] = useState<
    string | undefined
  >(undefined);
  const [selectedSeasonId, setSelectedSeasonId] = useState<string | undefined>(
    undefined,
  );
  const [selectedTournamentId, setSelectedTournamentId] = useState<
    string | undefined
  >(undefined);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const toggleFilter = (id: string) =>
    setActiveFilter((prev) => (prev === id ? null : id));
  const filters: StatsFilters = {
    ...(selectedYear ? { year: selectedYear } : {}),
    ...(selectedMatchType ? { matchType: selectedMatchType } : {}),
    ...(selectedSeasonId ? { seasonId: selectedSeasonId } : {}),
    ...(selectedTournamentId ? { tournamentId: selectedTournamentId } : {}),
  };
  const { seasons } = useSeasons(data?.user.id);
  const { tournaments } = useTournaments(data?.user.id);
  const {
    battingStats,
    pitchingStats,
    isLoading: isStatsLoading,
    refetch: refetchStats,
    isRefreshing: isStatsRefreshing,
  } = useUserStats(data?.user.id, filters);

  // 試合結果
  const [gameCurrentPage, setGameCurrentPage] = useState(1);
  const {
    gameResults,
    pagination: gamePagination,
    isLoading: isGamesLoading,
    isFetching: isGamesFetching,
    isRefreshing: isGamesRefreshing,
    refetch: refetchGames,
  } = useFilteredUserGameResults(data?.user.id, {
    page: gameCurrentPage,
    sort_by: "date",
    sort_order: "desc",
  });

  const handleGamePageChange = useCallback((page: number) => {
    setGameCurrentPage(page);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, []);

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
      pathname: "/(profile)/game-detail",
      params: {
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
      ref={scrollRef}
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
      {/* フォローリクエストバナー */}
      {data.incoming_follow_request_id && (
        <FollowRequestBanner
          followRequestId={data.incoming_follow_request_id}
          actorName={data.user.name ?? "このユーザー"}
        />
      )}

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
                  seasonFilter={
                    <View
                      style={{
                        flexDirection: "row",
                        gap: 8,
                        flexWrap: "wrap",
                      }}
                    >
                      <FilterDropdown
                        label="年度"
                        value={selectedYear}
                        options={[
                          { key: "all", label: "通算" },
                          ...Array.from({ length: 5 }, (_, i) => {
                            const y = String(new Date().getFullYear() - i);
                            return { key: y, label: y };
                          }),
                        ]}
                        onSelect={(v) =>
                          setSelectedYear(v === "all" ? undefined : v)
                        }
                        isOpen={activeFilter === "year"}
                        onToggle={() => toggleFilter("year")}
                      />
                      <FilterDropdown
                        label="種別"
                        value={selectedMatchType}
                        options={MATCH_TYPE_OPTIONS}
                        onSelect={setSelectedMatchType}
                        isOpen={activeFilter === "matchType"}
                        onToggle={() => toggleFilter("matchType")}
                      />
                      <FilterDropdown
                        label="シーズン"
                        value={selectedSeasonId}
                        options={seasons.map((s) => ({
                          key: String(s.id),
                          label: s.name,
                        }))}
                        onSelect={setSelectedSeasonId}
                        isOpen={activeFilter === "season"}
                        onToggle={() => toggleFilter("season")}
                      />
                      {tournaments.length > 0 && (
                        <FilterDropdown
                          label="大会"
                          value={selectedTournamentId}
                          options={tournaments.map((t) => ({
                            key: String(t.id),
                            label: t.name,
                          }))}
                          onSelect={setSelectedTournamentId}
                          isOpen={activeFilter === "tournament"}
                          onToggle={() => toggleFilter("tournament")}
                        />
                      )}
                    </View>
                  }
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
                  <>
                    {gameResults.map((item) => (
                      <View
                        key={item.game_result_id}
                        style={
                          isGamesFetching && !isGamesLoading
                            ? { opacity: 0.5 }
                            : undefined
                        }
                      >
                        <GameResultListItem
                          game={item}
                          onPress={handlePressGame}
                        />
                      </View>
                    ))}
                    {gamePagination ? (
                      <GamePagination
                        currentPage={gamePagination.current_page}
                        totalPages={gamePagination.total_pages}
                        totalCount={gamePagination.total_count}
                        perPage={gamePagination.per_page}
                        onPageChange={handleGamePageChange}
                      />
                    ) : null}
                  </>
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

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ActivityIndicator,
  StyleSheet,
  Animated,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Share } from "react-native";
import { useProfile } from "@hooks/useProfile";
import { useProfileStats } from "@hooks/useProfileStats";
import { useUserProfileDetail } from "@hooks/useRelationship";
import { useMySeasons } from "@hooks/useSeasons";
import {
  useTeams,
  usePrefectures,
  useBaseballCategories,
} from "@hooks/useMasterData";
import { useUserAwards } from "@hooks/useAwards";
import { ProfileHeader } from "@components/profile/ProfileHeader";
import { ProfileStatsTab } from "@components/profile/ProfileStatsTab";
import { ProfileGamesTab } from "@components/profile/ProfileGamesTab";
import type { StatsFilters } from "../../../types/profile";

export default function ProfileScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedSeasonId, setSelectedSeasonId] = useState<string | undefined>(
    undefined,
  );
  const filters: StatsFilters = {
    ...(selectedSeasonId ? { seasonId: selectedSeasonId } : {}),
  };
  const [menuVisible, setMenuVisible] = useState(false);
  const menuOpacity = useRef(new Animated.Value(0)).current;

  const openMenu = () => {
    setMenuVisible(true);
    Animated.timing(menuOpacity, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  const closeMenu = useCallback(() => {
    Animated.timing(menuOpacity, {
      toValue: 0,
      duration: 120,
      useNativeDriver: true,
    }).start(() => setMenuVisible(false));
  }, [menuOpacity]);

  const handleMenuItem = (action: () => void) => {
    closeMenu();
    action();
  };

  useEffect(() => {
    return () => closeMenu();
  }, [closeMenu]);

  const { profile, isLoading, refetch, isRefreshing } = useProfile();
  const { seasons } = useMySeasons();
  const { data: profileDetail } = useUserProfileDetail(
    profile?.user_id ?? undefined,
  );
  const {
    battingStats,
    pitchingStats,
    isLoading: isStatsLoading,
    refetch: refetchStats,
    isRefreshing: isStatsRefreshing,
  } = useProfileStats(filters);

  // マスターデータ・受賞歴
  const { data: teams } = useTeams();
  const { data: prefectures } = usePrefectures();
  const { data: categories } = useBaseballCategories();
  const { data: awards } = useUserAwards(profile?.id);

  const team = teams?.find((t) => t.id === profile?.team_id);
  const categoryName = categories?.find(
    (c) => c.id === team?.category_id,
  )?.name;
  const prefectureName = prefectures?.find(
    (p) => p.id === team?.prefecture_id,
  )?.name;

  const handleSharePress = async () => {
    if (!profile?.user_id) return;
    await Share.share({
      message: `BUZZ BASEで${profile.name ?? ""}のプロフィールをチェック！\nhttps://buzzbase.jp/${profile.user_id}`,
    });
  };

  const handleRefresh = () => {
    refetch();
    refetchStats();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#d08000" />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <View style={{ flexDirection: "row", gap: 16 }}>
              <TouchableOpacity
                onPress={() => router.push("/(profile)/search")}
              >
                <Ionicons name="search-outline" size={22} color="#F4F4F4" />
              </TouchableOpacity>
              <TouchableOpacity onPress={openMenu}>
                <Ionicons name="menu" size={24} color="#F4F4F4" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <View style={styles.container}>
        {profile && (
          <ProfileHeader
            profile={profile}
            followingCount={profileDetail?.following_count ?? undefined}
            followersCount={profileDetail?.followers_count ?? undefined}
            positions={profile.positions}
            teamName={team?.name}
            categoryName={categoryName}
            prefectureName={prefectureName}
            awards={awards}
            showEditButton
            onEditPress={() => router.push("/(profile)/edit")}
            onSharePress={handleSharePress}
            onFollowingCountPress={() => {
              if (profileDetail) {
                router.push({
                  pathname: "/(profile)/follows",
                  params: {
                    id: String(profileDetail.user.id),
                    tab: "following",
                  },
                });
              }
            }}
            onFollowersCountPress={() => {
              if (profileDetail) {
                router.push({
                  pathname: "/(profile)/follows",
                  params: {
                    id: String(profileDetail.user.id),
                    tab: "followers",
                  },
                });
              }
            }}
          />
        )}

        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 0 && styles.activeTab]}
            onPress={() => setActiveTab(0)}
          >
            <Text
              style={[styles.tabText, activeTab === 0 && styles.activeTabText]}
            >
              成績
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 1 && styles.activeTab]}
            onPress={() => setActiveTab(1)}
          >
            <Text
              style={[styles.tabText, activeTab === 1 && styles.activeTabText]}
            >
              試合
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 0 ? (
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing || isStatsRefreshing}
                onRefresh={handleRefresh}
                tintColor="#d08000"
              />
            }
          >
            {seasons.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.seasonFilterContainer}
                contentContainerStyle={styles.seasonFilterContent}
              >
                <TouchableOpacity
                  style={[
                    styles.seasonChip,
                    !selectedSeasonId && styles.seasonChipActive,
                  ]}
                  onPress={() => setSelectedSeasonId(undefined)}
                >
                  <Text
                    style={[
                      styles.seasonChipText,
                      !selectedSeasonId && styles.seasonChipTextActive,
                    ]}
                  >
                    すべて
                  </Text>
                </TouchableOpacity>
                {seasons.map((season) => (
                  <TouchableOpacity
                    key={season.id}
                    style={[
                      styles.seasonChip,
                      selectedSeasonId === String(season.id) &&
                        styles.seasonChipActive,
                    ]}
                    onPress={() => setSelectedSeasonId(String(season.id))}
                  >
                    <Text
                      style={[
                        styles.seasonChipText,
                        selectedSeasonId === String(season.id) &&
                          styles.seasonChipTextActive,
                      ]}
                    >
                      {season.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
            {isStatsLoading ? (
              <ActivityIndicator color="#d08000" style={{ marginTop: 20 }} />
            ) : (
              <ProfileStatsTab
                battingStats={battingStats}
                pitchingStats={pitchingStats}
              />
            )}
          </ScrollView>
        ) : (
          <View style={styles.content}>
            <ProfileGamesTab />
          </View>
        )}
      </View>

      {menuVisible && (
        <TouchableWithoutFeedback onPress={closeMenu}>
          <View style={styles.menuOverlay}>
            <Animated.View
              style={[styles.menuContainer, { opacity: menuOpacity }]}
            >
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() =>
                  handleMenuItem(() => router.push("/(profile)/notes"))
                }
              >
                <Ionicons name="book-outline" size={20} color="#F4F4F4" />
                <Text style={styles.menuItemText}>野球ノート</Text>
              </TouchableOpacity>
              <View style={styles.menuDivider} />
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() =>
                  handleMenuItem(() => router.push("/(profile)/seasons"))
                }
              >
                <Ionicons name="calendar-outline" size={20} color="#F4F4F4" />
                <Text style={styles.menuItemText}>シーズン管理</Text>
              </TouchableOpacity>
              <View style={styles.menuDivider} />
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() =>
                  handleMenuItem(() => router.push("/(profile)/edit"))
                }
              >
                <Ionicons name="settings-outline" size={20} color="#F4F4F4" />
                <Text style={styles.menuItemText}>設定</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      )}
    </>
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
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#424242",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#d08000",
  },
  tabText: {
    color: "#A1A1AA",
    fontSize: 14,
    fontWeight: "600",
  },
  activeTabText: {
    color: "#d08000",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  menuOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  menuContainer: {
    position: "absolute",
    top: 4,
    right: 16,
    backgroundColor: "#3A3A3A",
    borderRadius: 10,
    paddingVertical: 4,
    minWidth: 160,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  menuItemText: {
    color: "#F4F4F4",
    fontSize: 15,
    fontWeight: "500",
  },
  menuDivider: {
    height: 1,
    backgroundColor: "#4A4A4A",
    marginHorizontal: 12,
  },
  seasonFilterContainer: {
    marginBottom: 12,
    marginHorizontal: -16,
  },
  seasonFilterContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  seasonChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#424242",
  },
  seasonChipActive: {
    backgroundColor: "#d08000",
  },
  seasonChipText: {
    color: "#A1A1AA",
    fontSize: 13,
    fontWeight: "500",
  },
  seasonChipTextActive: {
    color: "#FFFFFF",
  },
});

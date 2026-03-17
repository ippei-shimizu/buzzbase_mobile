import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  RefreshControl,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ActivityIndicator,
  StyleSheet,
  Animated,
  Share,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
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
import { useGameResults } from "@hooks/useGameResults";
import { ProfileHeader } from "@components/profile/ProfileHeader";
import { ProfileStatsTab } from "@components/profile/ProfileStatsTab";
import { GameResultListItem } from "@components/game-results/GameResultListItem";
import type { StatsFilters } from "../../../types/profile";
import type { GameResult } from "../../../types/gameResult";

function FilterDropdown({
  label,
  value,
  options,
  onSelect,
  isOpen,
  onToggle,
}: {
  label: string;
  value: string | undefined;
  options: { key: string; label: string }[];
  onSelect: (key: string | undefined) => void;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const selectedLabel = options.find((o) => o.key === value)?.label ?? "全て";

  return (
    <View style={{ zIndex: isOpen ? 100 : 0 }}>
      <TouchableOpacity style={filterStyles.button} onPress={onToggle}>
        <Text style={filterStyles.buttonText}>
          {label}: {selectedLabel}
        </Text>
        <Ionicons name="chevron-down" size={14} color="#A1A1AA" />
      </TouchableOpacity>

      {isOpen && (
        <>
          <TouchableWithoutFeedback onPress={onToggle}>
            <View style={filterStyles.overlayBg} />
          </TouchableWithoutFeedback>
          <View style={filterStyles.dropdown}>
            <TouchableOpacity
              style={[
                filterStyles.dropdownItem,
                !value && filterStyles.dropdownItemActive,
              ]}
              onPress={() => {
                onSelect(undefined);
                onToggle();
              }}
            >
              <Text
                style={[
                  filterStyles.dropdownText,
                  !value && filterStyles.dropdownTextActive,
                ]}
              >
                全て
              </Text>
            </TouchableOpacity>
            {options.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                style={[
                  filterStyles.dropdownItem,
                  value === opt.key && filterStyles.dropdownItemActive,
                ]}
                onPress={() => {
                  onSelect(opt.key);
                  onToggle();
                }}
              >
                <Text
                  style={[
                    filterStyles.dropdownText,
                    value === opt.key && filterStyles.dropdownTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

const MATCH_TYPE_OPTIONS = [
  { key: "regular", label: "公式戦" },
  { key: "open", label: "オープン戦" },
];

const filterStyles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: "#71717b",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  buttonText: {
    color: "#F4F4F4",
    fontSize: 12,
    fontWeight: "500",
  },
  overlayBg: {
    position: "fixed" as never,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99,
  },
  dropdown: {
    position: "absolute",
    top: 36,
    left: 0,
    zIndex: 100,
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
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  dropdownItemActive: {
    backgroundColor: "#4A4A4A",
  },
  dropdownText: {
    color: "#F4F4F4",
    fontSize: 14,
  },
  dropdownTextActive: {
    color: "#d08000",
  },
});

export default function ProfileScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedYear, setSelectedYear] = useState<string | undefined>(
    undefined,
  );
  const [selectedMatchType, setSelectedMatchType] = useState<
    string | undefined
  >(undefined);
  const [selectedSeasonId, setSelectedSeasonId] = useState<string | undefined>(
    undefined,
  );
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const toggleFilter = (id: string) =>
    setActiveFilter((prev) => (prev === id ? null : id));
  const filters: StatsFilters = {
    ...(selectedYear ? { year: selectedYear } : {}),
    ...(selectedMatchType ? { matchType: selectedMatchType } : {}),
    ...(selectedSeasonId ? { seasonId: selectedSeasonId } : {}),
  };
  // 試合タブフィルター
  const [gameSearchQuery, setGameSearchQuery] = useState("");
  const [gameSortDesc, setGameSortDesc] = useState(true);

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

  // 試合結果
  const {
    gameResults,
    isLoading: isGamesLoading,
    isRefreshing: isGamesRefreshing,
    refetch: refetchGames,
  } = useGameResults();

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
    refetchGames();
  };

  const handlePressGame = (game: GameResult) => {
    router.push(`/(game-results)/${game.game_result_id}`);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#d08000" />
      </View>
    );
  }

  const headerComponent = (
    <>
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
    </>
  );

  const tabBar = (
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
            activeTab === 0 ? styles.tabPillActive : styles.tabPillInactive,
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
            activeTab === 1 ? styles.tabPillActive : styles.tabPillInactive,
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
  );

  // 成績タブ: ScrollView ベース
  if (activeTab === 0) {
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

        <ScrollView
          style={styles.container}
          stickyHeaderIndices={[1]}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing || isStatsRefreshing}
              onRefresh={handleRefresh}
              tintColor="#d08000"
            />
          }
        >
          {headerComponent}
          {tabBar}
          <View style={styles.contentContainer}>
            {isStatsLoading ? (
              <ActivityIndicator color="#d08000" style={{ marginTop: 20 }} />
            ) : (
              <ProfileStatsTab
                battingStats={battingStats}
                pitchingStats={pitchingStats}
                seasonFilter={
                  <View
                    style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}
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
                  </View>
                }
              />
            )}
          </View>
        </ScrollView>

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

  // 試合タブ: ScrollView ベース（mapで展開）
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

      <ScrollView
        style={styles.container}
        stickyHeaderIndices={[1]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing || isGamesRefreshing}
            onRefresh={handleRefresh}
            tintColor="#d08000"
          />
        }
      >
        {headerComponent}
        {tabBar}
        <View style={styles.contentContainer}>
          {/* フィルター */}
          <View
            style={{
              flexDirection: "row",
              gap: 8,
              flexWrap: "wrap",
              marginBottom: 12,
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
              onSelect={(v) => setSelectedYear(v === "all" ? undefined : v)}
              isOpen={activeFilter === "game-year"}
              onToggle={() => toggleFilter("game-year")}
            />
            <FilterDropdown
              label="種別"
              value={selectedMatchType}
              options={MATCH_TYPE_OPTIONS}
              onSelect={setSelectedMatchType}
              isOpen={activeFilter === "game-matchType"}
              onToggle={() => toggleFilter("game-matchType")}
            />
            <FilterDropdown
              label="シーズン"
              value={selectedSeasonId}
              options={seasons.map((s) => ({
                key: String(s.id),
                label: s.name,
              }))}
              onSelect={setSelectedSeasonId}
              isOpen={activeFilter === "game-season"}
              onToggle={() => toggleFilter("game-season")}
            />
          </View>

          {/* 検索 + ソート */}
          <View
            style={{
              flexDirection: "row",
              gap: 8,
              marginBottom: 12,
              alignItems: "center",
            }}
          >
            <View style={styles.searchBox}>
              <Ionicons name="search" size={16} color="#71717A" />
              <TextInput
                style={styles.searchInput}
                placeholder="対戦相手を検索"
                placeholderTextColor="#71717A"
                value={gameSearchQuery}
                onChangeText={setGameSearchQuery}
              />
            </View>
            <TouchableOpacity
              style={filterStyles.button}
              onPress={() => setGameSortDesc((p) => !p)}
            >
              <Text style={filterStyles.buttonText}>
                日付（{gameSortDesc ? "新しい順" : "古い順"}）
              </Text>
              <Ionicons name="chevron-down" size={14} color="#A1A1AA" />
            </TouchableOpacity>
          </View>

          <View style={styles.gamesContainer}>
            {isGamesLoading ? (
              <ActivityIndicator color="#d08000" style={{ marginTop: 40 }} />
            ) : (
              (() => {
                let filtered = gameResults.filter((g) => {
                  if (selectedYear && selectedYear !== "all") {
                    const year = new Date(
                      g.match_result.date_and_time,
                    ).getFullYear();
                    if (String(year) !== selectedYear) return false;
                  }
                  if (
                    selectedMatchType &&
                    g.match_result.match_type !== selectedMatchType
                  )
                    return false;
                  if (
                    selectedSeasonId &&
                    String(g.season_id) !== selectedSeasonId
                  )
                    return false;
                  if (gameSearchQuery.trim()) {
                    const q = gameSearchQuery.trim().toLowerCase();
                    if (
                      !g.match_result.opponent_team_name
                        ?.toLowerCase()
                        .includes(q)
                    )
                      return false;
                  }
                  return true;
                });
                filtered = filtered.sort((a, b) => {
                  const da = new Date(a.match_result.date_and_time).getTime();
                  const db = new Date(b.match_result.date_and_time).getTime();
                  return gameSortDesc ? db - da : da - db;
                });
                return filtered.length === 0 ? (
                  <Text style={styles.emptyText}>試合記録がありません</Text>
                ) : (
                  filtered.map((item) => (
                    <GameResultListItem
                      key={item.game_result_id}
                      game={item}
                      onPress={handlePressGame}
                    />
                  ))
                );
              })()
            )}
          </View>
        </View>
      </ScrollView>

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
    paddingBottom: 32,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#71717b",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    color: "#F4F4F4",
    fontSize: 13,
    padding: 0,
  },
  gamesContainer: {
    backgroundColor: "#27272a",
    borderRadius: 12,
    padding: 16,
  },
  gameCardContainer: {
    paddingHorizontal: 16,
  },
  emptyText: {
    color: "#A1A1AA",
    fontSize: 14,
    textAlign: "center",
    marginTop: 40,
    marginBottom: 40,
    width: "100%",
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
});

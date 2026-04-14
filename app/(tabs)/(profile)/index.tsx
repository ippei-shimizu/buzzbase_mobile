import type { GameResult } from "../../../types/gameResult";
import type { StatsFilters } from "../../../types/profile";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";
import React, { useRef, useState, useEffect, useCallback } from "react";
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
  Keyboard,
  Platform,
} from "react-native";
import { GamePagination } from "@components/game-results/GamePagination";
import { GameResultListItem } from "@components/game-results/GameResultListItem";
import { CalendarIcon } from "@components/icon/CalendarIcon";
import { MailIcon } from "@components/icon/MailIcon";
import { MenuIcon } from "@components/icon/MenuIcon";
import { NoteIcon } from "@components/icon/NoteIcon";
import { ProfileHeader } from "@components/profile/ProfileHeader";
import { ProfileStatsTab } from "@components/profile/ProfileStatsTab";
import { useUserAwards } from "@hooks/useAwards";
import { useFilteredGameResults } from "@hooks/useGameResults";
import {
  useTeams,
  usePrefectures,
  useBaseballCategories,
} from "@hooks/useMasterData";
import { useProfile } from "@hooks/useProfile";
import { useProfileStats } from "@hooks/useProfileStats";
import { useUserProfileDetail } from "@hooks/useRelationship";
import { useMySeasons } from "@hooks/useSeasons";
import { useTournaments } from "@hooks/useTournaments";

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
            <ScrollView style={filterStyles.dropdownScroll} nestedScrollEnabled>
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
            </ScrollView>
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
    position: "absolute" as const,
    top: -500,
    left: -500,
    right: -500,
    bottom: -500,
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
  dropdownScroll: {
    maxHeight: 280,
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
  const gameScrollRef = useRef<ScrollView>(null);
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
  // 試合タブフィルター
  const [gameSearchQuery, setGameSearchQuery] = useState("");
  const [debouncedGameSearch, setDebouncedGameSearch] = useState("");
  const [gameSortDesc, setGameSortDesc] = useState(true);
  const [gameCurrentPage, setGameCurrentPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedGameSearch(gameSearchQuery);
      setGameCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [gameSearchQuery]);

  const [keyboardHeight, setKeyboardHeight] = useState(0);
  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

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
  const { tournaments } = useTournaments();
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
    pagination: gamePagination,
    isLoading: isGamesLoading,
    isFetching: isGamesFetching,
    isRefreshing: isGamesRefreshing,
    refetch: refetchGames,
  } = useFilteredGameResults({
    page: gameCurrentPage,
    year: selectedYear ?? "通算",
    match_type: selectedMatchType ?? "全て",
    season_id: selectedSeasonId,
    tournament_id: selectedTournamentId,
    search: debouncedGameSearch || undefined,
    sort_by: "date",
    sort_order: gameSortDesc ? "desc" : "asc",
  });

  const team = teams?.find((t) => t.id === profile?.team_id);
  const categoryName = categories?.find(
    (c) => c.id === team?.category_id,
  )?.name;
  const prefectureName = prefectures?.find(
    (p) => p.id === team?.prefecture_id,
  )?.name;

  const handleSharePress = async () => {
    if (!profile?.user_id) return;
    try {
      await Share.share({
        message: `BUZZ BASEで${profile.name ?? ""}のプロフィールをチェック！\nhttps://buzzbase.jp/${profile.user_id}`,
      });
    } catch {
      // ユーザーがキャンセルした場合やシェア失敗時は無視
    }
  };

  const handleRefresh = () => {
    refetch();
    refetchStats();
    refetchGames();
  };

  const handleGamePageChange = useCallback((page: number) => {
    setGameCurrentPage(page);
    gameScrollRef.current?.scrollTo({ y: 0, animated: true });
  }, []);

  const handlePressGame = (game: GameResult) => {
    router.push({
      pathname: "/(game-results)/[id]",
      params: { id: game.game_result_id, game: JSON.stringify(game) },
    });
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
                  <MenuIcon size={24} color="#F4F4F4" />
                </TouchableOpacity>
              </View>
            ),
          }}
        />

        <ScrollView
          style={styles.container}
          contentContainerStyle={{
            paddingBottom: keyboardHeight > 0 ? keyboardHeight : 0,
          }}
          stickyHeaderIndices={[1]}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
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
                      onSelect={(v) => {
                        setSelectedYear(v === "all" ? undefined : v);
                        setGameCurrentPage(1);
                      }}
                      isOpen={activeFilter === "year"}
                      onToggle={() => toggleFilter("year")}
                    />
                    <FilterDropdown
                      label="種別"
                      value={selectedMatchType}
                      options={MATCH_TYPE_OPTIONS}
                      onSelect={(v) => {
                        setSelectedMatchType(v);
                        setGameCurrentPage(1);
                      }}
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
                      onSelect={(v) => {
                        setSelectedSeasonId(v);
                        setGameCurrentPage(1);
                      }}
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
                        onSelect={(v) => {
                          setSelectedTournamentId(v);
                          setGameCurrentPage(1);
                        }}
                        isOpen={activeFilter === "tournament"}
                        onToggle={() => toggleFilter("tournament")}
                      />
                    )}
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
                  <NoteIcon size={20} color="#F4F4F4" />
                  <Text style={styles.menuItemText}>野球ノート</Text>
                </TouchableOpacity>
                <View style={styles.menuDivider} />
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() =>
                    handleMenuItem(() => router.push("/(profile)/seasons"))
                  }
                >
                  <CalendarIcon size={20} color="#F4F4F4" />
                  <Text style={styles.menuItemText}>シーズン管理</Text>
                </TouchableOpacity>
                <View style={styles.menuDivider} />
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() =>
                    handleMenuItem(() =>
                      router.push("/(profile)/calculation-of-grades"),
                    )
                  }
                >
                  <Ionicons
                    name="calculator-outline"
                    size={20}
                    color="#F4F4F4"
                  />
                  <Text style={styles.menuItemText}>成績の算出方法</Text>
                </TouchableOpacity>
                <View style={styles.menuDivider} />
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() =>
                    handleMenuItem(() => router.push("/(profile)/contact"))
                  }
                >
                  <MailIcon size={20} color="#F4F4F4" />
                  <Text style={styles.menuItemText}>お問い合わせ</Text>
                </TouchableOpacity>
                <View style={styles.menuDivider} />
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() =>
                    handleMenuItem(() => router.push("/(profile)/settings"))
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
                <MenuIcon size={24} color="#F4F4F4" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <ScrollView
        ref={gameScrollRef}
        style={styles.container}
        contentContainerStyle={{
          paddingBottom: keyboardHeight > 0 ? keyboardHeight : 0,
        }}
        stickyHeaderIndices={[1]}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
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
              onSelect={(v) => {
                setSelectedYear(v === "all" ? undefined : v);
                setGameCurrentPage(1);
              }}
              isOpen={activeFilter === "game-year"}
              onToggle={() => toggleFilter("game-year")}
            />
            <FilterDropdown
              label="種別"
              value={selectedMatchType}
              options={MATCH_TYPE_OPTIONS}
              onSelect={(v) => {
                setSelectedMatchType(v);
                setGameCurrentPage(1);
              }}
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
              onSelect={(v) => {
                setSelectedSeasonId(v);
                setGameCurrentPage(1);
              }}
              isOpen={activeFilter === "game-season"}
              onToggle={() => toggleFilter("game-season")}
            />
            {tournaments.length > 0 && (
              <FilterDropdown
                label="大会"
                value={selectedTournamentId}
                options={tournaments.map((t) => ({
                  key: String(t.id),
                  label: t.name,
                }))}
                onSelect={(v) => {
                  setSelectedTournamentId(v);
                  setGameCurrentPage(1);
                }}
                isOpen={activeFilter === "game-tournament"}
                onToggle={() => toggleFilter("game-tournament")}
              />
            )}
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
              onPress={() => {
                setGameSortDesc((p) => !p);
                setGameCurrentPage(1);
              }}
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
                    <GameResultListItem game={item} onPress={handlePressGame} />
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
                <NoteIcon size={20} color="#F4F4F4" />
                <Text style={styles.menuItemText}>野球ノート</Text>
              </TouchableOpacity>
              <View style={styles.menuDivider} />
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() =>
                  handleMenuItem(() => router.push("/(profile)/seasons"))
                }
              >
                <CalendarIcon size={20} color="#F4F4F4" />
                <Text style={styles.menuItemText}>シーズン管理</Text>
              </TouchableOpacity>
              <View style={styles.menuDivider} />
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() =>
                  handleMenuItem(() =>
                    router.push("/(profile)/calculation-of-grades"),
                  )
                }
              >
                <Ionicons name="calculator-outline" size={20} color="#F4F4F4" />
                <Text style={styles.menuItemText}>成績の算出方法</Text>
              </TouchableOpacity>
              <View style={styles.menuDivider} />
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() =>
                  handleMenuItem(() => router.push("/(profile)/contact"))
                }
              >
                <MailIcon size={20} color="#F4F4F4" />
                <Text style={styles.menuItemText}>お問い合わせ</Text>
              </TouchableOpacity>
              <View style={styles.menuDivider} />
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() =>
                  handleMenuItem(() => router.push("/(profile)/settings"))
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

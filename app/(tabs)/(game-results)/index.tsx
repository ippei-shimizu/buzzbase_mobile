import type { GameResult } from "../../../types/gameResult";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, {
  useRef,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ActivityIndicator,
  StyleSheet,
  Keyboard,
  Platform,
} from "react-native";
import { GameResultListItem } from "@components/game-results/GameResultListItem";
import { GameResultSummary } from "@components/stats/GameResultSummary";
import { useGameResults } from "@hooks/useGameResults";
import { useMySeasons } from "@hooks/useSeasons";
import { useGameSummary } from "@hooks/useStats";

type ScreenTab = "summary" | "list";

const MATCH_TYPE_OPTIONS = [
  { key: "regular", label: "公式戦" },
  { key: "open", label: "オープン戦" },
];

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

export default function GameResultsScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const {
    gameResults,
    isLoading,
    isError,
    refetch,
    isRefreshing,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGameResults();
  const { seasons } = useMySeasons();

  // Screen tab state
  const [screenTab, setScreenTab] = useState<ScreenTab>("summary");

  // Summary tab filters (independent)
  const [summaryYear, setSummaryYear] = useState<string | undefined>(undefined);
  const [summaryMatchType, setSummaryMatchType] = useState<string | undefined>(
    undefined,
  );
  const [summarySeasonId, setSummarySeasonId] = useState<string | undefined>(
    undefined,
  );
  const [summaryActiveFilter, setSummaryActiveFilter] = useState<string | null>(
    null,
  );
  const toggleSummaryFilter = (id: string) =>
    setSummaryActiveFilter((prev) => (prev === id ? null : id));
  const gameSummary = useGameSummary(
    summaryYear,
    summaryMatchType,
    summarySeasonId,
  );
  const [summaryRefreshing, setSummaryRefreshing] = useState(false);
  const onSummaryRefresh = useCallback(async () => {
    setSummaryRefreshing(true);
    await gameSummary.refetch();
    setSummaryRefreshing(false);
  }, [gameSummary.refetch]); // eslint-disable-line react-hooks/exhaustive-deps

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
  const [searchQuery, setSearchQuery] = useState("");
  const [sortDesc, setSortDesc] = useState(true);

  const filteredResults = useMemo(() => {
    let filtered = gameResults.filter((g) => {
      if (selectedYear && selectedYear !== "all") {
        const year = new Date(g.match_result.date_and_time).getFullYear();
        if (String(year) !== selectedYear) return false;
      }
      if (selectedMatchType && g.match_result.match_type !== selectedMatchType)
        return false;
      if (selectedSeasonId && String(g.season_id) !== selectedSeasonId)
        return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        if (!g.match_result.opponent_team_name?.toLowerCase().includes(q))
          return false;
      }
      return true;
    });
    return filtered.sort((a, b) => {
      const da = new Date(a.match_result.date_and_time).getTime();
      const db = new Date(b.match_result.date_and_time).getTime();
      if (da !== db) return sortDesc ? db - da : da - db;
      return sortDesc
        ? b.game_result_id - a.game_result_id
        : a.game_result_id - b.game_result_id;
    });
  }, [
    gameResults,
    selectedYear,
    selectedMatchType,
    selectedSeasonId,
    searchQuery,
    sortDesc,
  ]);

  const handlePressItem = (game: GameResult) => {
    router.push({
      pathname: "/(game-results)/[id]",
      params: {
        id: game.game_result_id,
        game: JSON.stringify(game),
      },
    });
  };

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#d08000" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>データの取得に失敗しました</Text>
      </View>
    );
  }

  const listFilterHeader = (
    <View style={styles.filterSection}>
      {/* 試合記録ボタン */}
      <TouchableOpacity
        style={styles.recordButton}
        onPress={() => router.push("/(game-record)/step1-game-info")}
      >
        <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
        <Text style={styles.recordButtonText}>試合結果を記録する</Text>
      </TouchableOpacity>
      {/* フィルター */}
      <View
        style={{
          flexDirection: "row",
          gap: 8,
          flexWrap: "wrap",
          marginBottom: 12,
          zIndex: 100,
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

      {/* 検索 + ソート */}
      <View
        style={{
          flexDirection: "row",
          gap: 8,
          alignItems: "center",
          zIndex: 1,
        }}
      >
        <View style={styles.searchBox}>
          <Ionicons name="search" size={16} color="#71717A" />
          <TextInput
            style={styles.searchInput}
            placeholder="対戦相手を検索"
            placeholderTextColor="#71717A"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() =>
              flatListRef.current?.scrollToOffset({ offset: 0, animated: true })
            }
          />
        </View>
        <TouchableOpacity
          style={filterStyles.button}
          onPress={() => setSortDesc((p) => !p)}
        >
          <Text style={filterStyles.buttonText}>
            日付（{sortDesc ? "新しい順" : "古い順"}）
          </Text>
          <Ionicons name="chevron-down" size={14} color="#A1A1AA" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const summaryYearOptions = [
    { key: "all", label: "通算" },
    ...Array.from({ length: 5 }, (_, i) => {
      const y = String(new Date().getFullYear() - i);
      return { key: y, label: y };
    }),
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#2E2E2E" }}>
      {/* Screen Tab Bar */}
      <View style={styles.screenTabBar}>
        <TouchableOpacity
          style={[
            styles.screenTab,
            screenTab === "summary" && styles.screenTabActive,
          ]}
          onPress={() => setScreenTab("summary")}
        >
          <Text
            style={[
              styles.screenTabText,
              screenTab === "summary" && styles.screenTabTextActive,
            ]}
          >
            サマリー
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.screenTab,
            screenTab === "list" && styles.screenTabActive,
          ]}
          onPress={() => setScreenTab("list")}
        >
          <Text
            style={[
              styles.screenTabText,
              screenTab === "list" && styles.screenTabTextActive,
            ]}
          >
            一覧
          </Text>
        </TouchableOpacity>
      </View>

      {/* Summary Tab */}
      {screenTab === "summary" && (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={summaryRefreshing}
              onRefresh={onSummaryRefresh}
              tintColor="#d08000"
            />
          }
        >
          <TouchableOpacity
            style={styles.recordButton}
            onPress={() => router.push("/(game-record)/step1-game-info")}
          >
            <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
            <Text style={styles.recordButtonText}>試合結果を記録する</Text>
          </TouchableOpacity>
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
            <FilterDropdown
              label="年度"
              value={summaryYear}
              options={summaryYearOptions}
              onSelect={(v) => setSummaryYear(v === "all" ? undefined : v)}
              isOpen={summaryActiveFilter === "summaryYear"}
              onToggle={() => toggleSummaryFilter("summaryYear")}
            />
            <FilterDropdown
              label="種別"
              value={summaryMatchType}
              options={MATCH_TYPE_OPTIONS}
              onSelect={setSummaryMatchType}
              isOpen={summaryActiveFilter === "summaryMatchType"}
              onToggle={() => toggleSummaryFilter("summaryMatchType")}
            />
            <FilterDropdown
              label="シーズン"
              value={summarySeasonId}
              options={seasons.map((s) => ({
                key: String(s.id),
                label: s.name,
              }))}
              onSelect={setSummarySeasonId}
              isOpen={summaryActiveFilter === "summarySeason"}
              onToggle={() => toggleSummaryFilter("summarySeason")}
            />
          </View>
          <Text style={styles.activeFilterLabel}>
            {summaryYear ? `${summaryYear}年` : "通算"}
            {summaryMatchType
              ? ` / ${MATCH_TYPE_OPTIONS.find((o) => o.key === summaryMatchType)?.label ?? summaryMatchType}`
              : ""}
            {summarySeasonId
              ? ` / ${seasons.find((s) => String(s.id) === summarySeasonId)?.name ?? ""}`
              : ""}
          </Text>
          {!gameSummary.data && gameSummary.isLoading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color="#d08000" />
            </View>
          ) : gameSummary.data ? (
            <View style={{ opacity: gameSummary.isFetching ? 0.5 : 1 }}>
              <GameResultSummary summary={gameSummary.data} />
            </View>
          ) : null}
        </ScrollView>
      )}

      {/* List Tab */}
      {screenTab === "list" && (
        <View style={{ flex: 1 }}>
          <View style={{ paddingHorizontal: 16, paddingTop: 16, zIndex: 100 }}>
            {listFilterHeader}
          </View>
          <FlatList
            ref={flatListRef}
            data={filteredResults}
            keyExtractor={(item) => String(item.game_result_id)}
            renderItem={({ item }) => (
              <View style={styles.cardContainer}>
                <GameResultListItem game={item} onPress={handlePressItem} />
              </View>
            )}
            contentContainerStyle={[
              { paddingHorizontal: 16, paddingBottom: 32, flexGrow: 1 },
              keyboardHeight > 0 && { paddingBottom: keyboardHeight + 16 },
            ]}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.5}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={refetch}
                tintColor="#d08000"
              />
            }
            ListFooterComponent={
              isFetchingNextPage ? (
                <View style={styles.footer}>
                  <ActivityIndicator color="#d08000" />
                </View>
              ) : null
            }
            ListEmptyComponent={
              <Text style={styles.emptyText}>試合結果がありません</Text>
            }
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screenTabBar: {
    flexDirection: "row",
    backgroundColor: "#2E2E2E",
    borderBottomWidth: 1,
    borderBottomColor: "#424242",
  },
  screenTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  screenTabActive: {
    borderBottomColor: "#d08000",
  },
  screenTabText: {
    color: "#A1A1AA",
    fontSize: 14,
    fontWeight: "600",
  },
  screenTabTextActive: {
    color: "#F4F4F4",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2E2E2E",
  },
  errorText: {
    color: "#A1A1AA",
    fontSize: 16,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
    flexGrow: 1,
  },
  recordButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#d08000",
    borderRadius: 8,
    paddingVertical: 12,
    marginBottom: 16,
  },
  recordButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  filterSection: {
    marginBottom: 12,
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
  cardContainer: {},
  footer: {
    paddingVertical: 16,
    alignItems: "center",
  },
  emptyText: {
    color: "#A1A1AA",
    fontSize: 14,
    textAlign: "center",
    marginTop: 40,
  },
  activeFilterLabel: {
    color: "#A1A1AA",
    fontSize: 12,
    marginBottom: 12,
  },
});

import type { StatsFilters as StatsFiltersType } from "../../types/profile";
import type { BattingTrendGranularity, StatsPeriod } from "../../types/stats";
import type { SprayChartMode } from "@components/stats/SprayChart";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useState, useCallback, useLayoutEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { BattingTrendChart } from "@components/stats/BattingTrendChart";
import { ContactQualityCard } from "@components/stats/ContactQualityCard";
import { CountSituationCards } from "@components/stats/CountSituationCards";
import { EraTrendChart } from "@components/stats/EraTrendChart";
import { HeadlineStatsCard } from "@components/stats/HeadlineStatsCard";
import { HitDirectionTable } from "@components/stats/HitDirectionTable";
import { OutTypeDonut } from "@components/stats/OutTypeDonut";
import { PeriodToggle } from "@components/stats/PeriodToggle";
import { PitcherFaceoffList } from "@components/stats/PitcherFaceoffList";
import { PitchTypeCard } from "@components/stats/PitchTypeCard";
import { PlateAppearanceDonut } from "@components/stats/PlateAppearanceDonut";
import { RunnersSituationCard } from "@components/stats/RunnersSituationCard";
import { SprayChart } from "@components/stats/SprayChart";
import { StatsFilters } from "@components/stats/StatsFilters";
import {
  StatsTable,
  BATTING_COLUMNS,
  PITCHING_COLUMNS,
} from "@components/stats/StatsTable";
import {
  GlobalMenuButton,
  GlobalMenuOverlay,
  useGlobalMenu,
} from "@components/ui/GlobalMenu";
import { useAvailableYears } from "@hooks/useAvailableYears";
import { useMySeasons } from "@hooks/useSeasons";
import {
  useBattingTrend,
  useContactQualities,
  useCountSituations,
  useHitDirections,
  useHitLocations,
  useOutTypeBreakdown,
  usePitchTypes,
  usePitcherFaceoffs,
  usePlateAppearanceBreakdown,
  useBattingStatsTable,
  usePitchingStatsTable,
  useEraTrend,
  useHeadlineStats,
  useRunnersSituation,
} from "@hooks/useStats";
import { useTournaments } from "@hooks/useTournaments";

type ActiveTab = "batting" | "pitching";

const currentYear = new Date().getFullYear().toString();

// テーブル用FilterDropdown（game-results/index.tsxと同じパターン）
function TableFilterDropdown({
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
      <TouchableOpacity style={tableFilterStyles.button} onPress={onToggle}>
        <Text style={tableFilterStyles.buttonText}>
          {label}: {selectedLabel}
        </Text>
        <Ionicons name="chevron-down" size={14} color="#A1A1AA" />
      </TouchableOpacity>

      {isOpen && (
        <>
          <TouchableWithoutFeedback onPress={onToggle}>
            <View style={tableFilterStyles.overlayBg} />
          </TouchableWithoutFeedback>
          <View style={tableFilterStyles.dropdown}>
            <ScrollView
              style={tableFilterStyles.dropdownScroll}
              nestedScrollEnabled
            >
              <TouchableOpacity
                style={[
                  tableFilterStyles.dropdownItem,
                  !value && tableFilterStyles.dropdownItemActive,
                ]}
                onPress={() => {
                  onSelect(undefined);
                  onToggle();
                }}
              >
                <Text
                  style={[
                    tableFilterStyles.dropdownText,
                    !value && tableFilterStyles.dropdownTextActive,
                  ]}
                >
                  全て
                </Text>
              </TouchableOpacity>
              {options.map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  style={[
                    tableFilterStyles.dropdownItem,
                    value === opt.key && tableFilterStyles.dropdownItemActive,
                  ]}
                  onPress={() => {
                    onSelect(opt.key);
                    onToggle();
                  }}
                >
                  <Text
                    style={[
                      tableFilterStyles.dropdownText,
                      value === opt.key && tableFilterStyles.dropdownTextActive,
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

function FetchingOverlay({
  isFetching,
  children,
}: {
  isFetching: boolean;
  children: React.ReactNode;
}) {
  return (
    <View>
      <View style={{ opacity: isFetching ? 0.5 : 1 }}>{children}</View>
      {isFetching && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ActivityIndicator size="small" color="#d08000" />
          </View>
        </View>
      )}
    </View>
  );
}

const tableFilterStyles = StyleSheet.create({
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
  buttonText: { color: "#F4F4F4", fontSize: 12, fontWeight: "500" },
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
    right: 0,
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
  dropdownItem: { paddingHorizontal: 16, paddingVertical: 10 },
  dropdownItemActive: { backgroundColor: "#4A4A4A" },
  dropdownText: { color: "#F4F4F4", fontSize: 14 },
  dropdownTextActive: { color: "#d08000" },
});

export default function StatsScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<ActiveTab>("batting");
  const [filters, setFilters] = useState<StatsFiltersType>({});
  const [battingPeriod, setBattingPeriod] = useState<StatsPeriod>("yearly");
  const [pitchingPeriod, setPitchingPeriod] = useState<StatsPeriod>("yearly");

  // テーブル専用フィルタ
  const [tableYear, setTableYear] = useState<string | undefined>(undefined);
  const [tableSeasonId, setTableSeasonId] = useState<string | undefined>(
    undefined,
  );
  const [tableTournamentId, setTableTournamentId] = useState<
    string | undefined
  >(undefined);
  const [tableActiveFilter, setTableActiveFilter] = useState<string | null>(
    null,
  );
  const toggleTableFilter = (id: string) =>
    setTableActiveFilter((prev) => (prev === id ? null : id));

  const { menuVisible, menuOpacity, openMenu, closeMenu } = useGlobalMenu();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <GlobalMenuButton onPress={openMenu} />,
      headerRightContainerStyle: { paddingRight: 16 },
    });
  }, [navigation, openMenu]);

  const { seasons } = useMySeasons();
  const { tournaments } = useTournaments();
  const { years: availableYears } = useAvailableYears();
  const hitDirections = useHitDirections(filters);
  const hitLocations = useHitLocations(filters);
  const outTypeBreakdown = useOutTypeBreakdown(filters);
  const countSituations = useCountSituations(filters);
  const contactQualities = useContactQualities(filters);
  const pitchTypes = usePitchTypes(filters);
  const pitcherFaceoffs = usePitcherFaceoffs(filters);
  const [battingTrendGranularity, setBattingTrendGranularity] =
    useState<BattingTrendGranularity>("game");
  const battingTrend = useBattingTrend(filters, battingTrendGranularity);
  const paBreakdown = usePlateAppearanceBreakdown(filters);
  const headlineStats = useHeadlineStats(filters);
  const runnersSituation = useRunnersSituation(filters);
  const [sprayChartMode, setSprayChartMode] =
    useState<SprayChartMode>("scatter");
  const battingTable = useBattingStatsTable(
    battingPeriod,
    tableYear,
    tableSeasonId,
    tableTournamentId,
  );
  const pitchingTable = usePitchingStatsTable(
    pitchingPeriod,
    tableYear,
    tableSeasonId,
    tableTournamentId,
  );
  const eraTrend = useEraTrend(
    filters.year,
    filters.seasonId,
    filters.tournamentId,
    activeTab === "pitching",
  );
  const isLoading =
    hitDirections.isLoading ||
    paBreakdown.isLoading ||
    battingTable.isLoading ||
    pitchingTable.isLoading ||
    eraTrend.isLoading;

  const [manualRefreshing, setManualRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setManualRefreshing(true);
    await Promise.all([
      hitDirections.refetch(),
      hitLocations.refetch(),
      outTypeBreakdown.refetch(),
      countSituations.refetch(),
      contactQualities.refetch(),
      pitchTypes.refetch(),
      pitcherFaceoffs.refetch(),
      battingTrend.refetch(),
      paBreakdown.refetch(),
      headlineStats.refetch(),
      runnersSituation.refetch(),
      battingTable.refetch(),
      pitchingTable.refetch(),
      eraTrend.refetch(),
    ]);
    setManualRefreshing(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    hitDirections.refetch,
    hitLocations.refetch,
    outTypeBreakdown.refetch,
    countSituations.refetch,
    contactQualities.refetch,
    pitchTypes.refetch,
    pitcherFaceoffs.refetch,
    battingTrend.refetch,
    paBreakdown.refetch,
    headlineStats.refetch,
    runnersSituation.refetch,
    battingTable.refetch,
    pitchingTable.refetch,
    eraTrend.refetch,
  ]);

  const handleBattingPeriodChange = useCallback(
    (period: StatsPeriod) => {
      setBattingPeriod(period);
      if (period !== "yearly" && !tableYear && !tableSeasonId) {
        setTableYear(currentYear);
      }
    },
    [tableYear, tableSeasonId],
  );

  const handlePitchingPeriodChange = useCallback(
    (period: StatsPeriod) => {
      setPitchingPeriod(period);
      if (period !== "yearly" && !tableYear && !tableSeasonId) {
        setTableYear(currentYear);
      }
    },
    [tableYear, tableSeasonId],
  );

  const yearOptions = availableYears.map((y) => ({
    key: y,
    label: y,
  }));

  const seasonOptions = seasons.map((s) => ({
    key: String(s.id),
    label: s.name,
  }));

  const tournamentOptions = tournaments.map((t) => ({
    key: String(t.id),
    label: t.name,
  }));

  const currentPeriod =
    activeTab === "batting" ? battingPeriod : pitchingPeriod;
  const showTableFilters = currentPeriod !== "yearly";

  const hasNoData =
    !hitDirections.data &&
    !paBreakdown.data &&
    !battingTable.data &&
    !pitchingTable.data &&
    !eraTrend.data;

  if (hasNoData && isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#d08000" />
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={manualRefreshing}
            onRefresh={onRefresh}
            tintColor="#d08000"
          />
        }
      >
        {/* Tab Bar */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "batting" && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab("batting")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "batting" && styles.tabTextActive,
              ]}
            >
              打撃
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "pitching" && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab("pitching")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "pitching" && styles.tabTextActive,
              ]}
            >
              投球
            </Text>
          </TouchableOpacity>
        </View>

        {/* Chart Filters */}
        <View style={styles.content}>
          <StatsFilters
            filters={filters}
            onFiltersChange={setFilters}
            availableYears={availableYears}
            availableSeasons={seasons.map((s) => ({
              id: String(s.id),
              name: s.name,
            }))}
            availableTournaments={tournaments.map((t) => ({
              id: String(t.id),
              name: t.name,
            }))}
          />
        </View>

        {/* Batting Tab (Issue #370 指定の 12 セクション順) */}
        {activeTab === "batting" && (
          <View style={styles.content}>
            {/* 1. HeadlineStatsCard */}
            {headlineStats.data && (
              <FetchingOverlay isFetching={headlineStats.isFetching}>
                <HeadlineStatsCard data={headlineStats.data} />
              </FetchingOverlay>
            )}
            {/* 2. RunnersSituationCard */}
            {runnersSituation.data && (
              <FetchingOverlay isFetching={runnersSituation.isFetching}>
                <RunnersSituationCard data={runnersSituation.data} />
              </FetchingOverlay>
            )}
            {/* 3. BattingTrendChart */}
            {battingTrend.data && (
              <FetchingOverlay isFetching={battingTrend.isFetching}>
                <BattingTrendChart
                  points={battingTrend.data.points}
                  granularity={battingTrendGranularity}
                  onGranularityChange={setBattingTrendGranularity}
                />
              </FetchingOverlay>
            )}
            {/* 5. CountSituationCards */}
            {countSituations.data && (
              <FetchingOverlay isFetching={countSituations.isFetching}>
                <CountSituationCards data={countSituations.data} />
              </FetchingOverlay>
            )}
            {/* 6. SprayChart */}
            {hitDirections.data && (
              <FetchingOverlay
                isFetching={hitDirections.isFetching || hitLocations.isFetching}
              >
                <SprayChart
                  directions={hitDirections.data.directions}
                  homeRuns={hitDirections.data.home_runs}
                  mode={sprayChartMode}
                  onModeChange={setSprayChartMode}
                  points={hitLocations.data?.points ?? []}
                />
              </FetchingOverlay>
            )}
            {/* 7. HitDirectionTable */}
            {hitDirections.data && (
              <FetchingOverlay isFetching={hitDirections.isFetching}>
                <HitDirectionTable directions={hitDirections.data.directions} />
              </FetchingOverlay>
            )}
            {/* 8. ContactQualityCard */}
            {contactQualities.data && (
              <FetchingOverlay isFetching={contactQualities.isFetching}>
                <ContactQualityCard
                  breakdown={contactQualities.data.breakdown}
                  total={contactQualities.data.total}
                />
              </FetchingOverlay>
            )}
            {/* 9. PitchTypeCard */}
            {pitchTypes.data && (
              <FetchingOverlay isFetching={pitchTypes.isFetching}>
                <PitchTypeCard
                  rows={pitchTypes.data.rows}
                  totalTargetPa={pitchTypes.data.total_target_pa}
                />
              </FetchingOverlay>
            )}
            {/* 10. PitcherFaceoffList */}
            {pitcherFaceoffs.data && (
              <FetchingOverlay isFetching={pitcherFaceoffs.isFetching}>
                <PitcherFaceoffList
                  rows={pitcherFaceoffs.data.rows}
                  minPlateAppearances={
                    pitcherFaceoffs.data.min_plate_appearances
                  }
                  totalTargetPa={pitcherFaceoffs.data.total_target_pa}
                />
              </FetchingOverlay>
            )}
            {/* 11. OutTypeDonut */}
            {outTypeBreakdown.data && (
              <FetchingOverlay isFetching={outTypeBreakdown.isFetching}>
                <OutTypeDonut
                  breakdown={outTypeBreakdown.data.breakdown}
                  total={outTypeBreakdown.data.total}
                />
              </FetchingOverlay>
            )}
            {/* 11. PlateAppearanceDonut */}
            {paBreakdown.data && (
              <FetchingOverlay isFetching={paBreakdown.isFetching}>
                <PlateAppearanceDonut
                  breakdown={paBreakdown.data}
                  totalPlateAppearances={paBreakdown.data.reduce(
                    (sum, c) => sum + c.count,
                    0,
                  )}
                />
              </FetchingOverlay>
            )}
            {/* 12. 打撃成績テーブル（最下部） */}
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderLabel}>打撃成績</Text>
              <PeriodToggle
                value={battingPeriod}
                onChange={handleBattingPeriodChange}
              />
            </View>
            {showTableFilters && (
              <View style={styles.tableFilterRow}>
                <TableFilterDropdown
                  label="年度"
                  value={tableYear}
                  options={yearOptions}
                  onSelect={setTableYear}
                  isOpen={tableActiveFilter === "tableYear"}
                  onToggle={() => toggleTableFilter("tableYear")}
                />
                {seasonOptions.length > 0 && (
                  <TableFilterDropdown
                    label="シーズン"
                    value={tableSeasonId}
                    options={seasonOptions}
                    onSelect={setTableSeasonId}
                    isOpen={tableActiveFilter === "tableSeason"}
                    onToggle={() => toggleTableFilter("tableSeason")}
                  />
                )}
                {tournamentOptions.length > 0 && (
                  <TableFilterDropdown
                    label="大会"
                    value={tableTournamentId}
                    options={tournamentOptions}
                    onSelect={setTableTournamentId}
                    isOpen={tableActiveFilter === "tableTournament"}
                    onToggle={() => toggleTableFilter("tableTournament")}
                  />
                )}
              </View>
            )}
            {battingTable.data && (
              <FetchingOverlay isFetching={battingTable.isFetching}>
                <StatsTable
                  rows={battingTable.data}
                  columns={BATTING_COLUMNS}
                  labelKey="label"
                />
              </FetchingOverlay>
            )}
            <View style={styles.tableBottomSpacer} />
          </View>
        )}

        {/* Pitching Tab */}
        {activeTab === "pitching" && (
          <View style={styles.content}>
            {eraTrend.data && eraTrend.data.length > 0 && (
              <FetchingOverlay isFetching={eraTrend.isFetching}>
                <EraTrendChart data={eraTrend.data} />
              </FetchingOverlay>
            )}
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderLabel}>投球成績</Text>
              <PeriodToggle
                value={pitchingPeriod}
                onChange={handlePitchingPeriodChange}
              />
            </View>
            {showTableFilters && (
              <View style={styles.tableFilterRow}>
                <TableFilterDropdown
                  label="年度"
                  value={tableYear}
                  options={yearOptions}
                  onSelect={setTableYear}
                  isOpen={tableActiveFilter === "tableYear"}
                  onToggle={() => toggleTableFilter("tableYear")}
                />
                {seasonOptions.length > 0 && (
                  <TableFilterDropdown
                    label="シーズン"
                    value={tableSeasonId}
                    options={seasonOptions}
                    onSelect={setTableSeasonId}
                    isOpen={tableActiveFilter === "tableSeason"}
                    onToggle={() => toggleTableFilter("tableSeason")}
                  />
                )}
                {tournamentOptions.length > 0 && (
                  <TableFilterDropdown
                    label="大会"
                    value={tableTournamentId}
                    options={tournamentOptions}
                    onSelect={setTableTournamentId}
                    isOpen={tableActiveFilter === "tableTournament"}
                    onToggle={() => toggleTableFilter("tableTournament")}
                  />
                )}
              </View>
            )}
            {pitchingTable.data && (
              <FetchingOverlay isFetching={pitchingTable.isFetching}>
                <StatsTable
                  rows={pitchingTable.data}
                  columns={PITCHING_COLUMNS}
                  labelKey="label"
                />
              </FetchingOverlay>
            )}
            <View style={styles.tableBottomSpacer} />
          </View>
        )}
      </ScrollView>

      <GlobalMenuOverlay
        visible={menuVisible}
        opacity={menuOpacity}
        onClose={closeMenu}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2E2E2E",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2E2E2E",
  },
  content: {
    paddingHorizontal: 16,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#2E2E2E",
    borderBottomWidth: 1,
    borderBottomColor: "#424242",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabButtonActive: {
    borderBottomColor: "#d08000",
  },
  tabText: {
    color: "#A1A1AA",
    fontSize: 14,
    fontWeight: "600",
  },
  tabTextActive: {
    color: "#F4F4F4",
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  tableHeaderLabel: {
    color: "#F4F4F4",
    fontSize: 16,
    fontWeight: "700",
  },
  tableFilterRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 12,
    justifyContent: "flex-end",
  },
  tableBottomSpacer: {
    height: 300,
  },
});

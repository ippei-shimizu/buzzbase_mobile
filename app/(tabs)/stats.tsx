import type { StatsFilters as StatsFiltersType } from "../../types/profile";
import type { BattingTrendGranularity, StatsPeriod } from "../../types/stats";
import type { SprayChartMode } from "@components/stats/SprayChart";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useCallback, useLayoutEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { PaywallModal } from "@components/pro/PaywallModal";
import { AdditionalStatsCard } from "@components/stats/AdditionalStatsCard";
import { BattingTrendChart } from "@components/stats/BattingTrendChart";
import { ContactQualityCard } from "@components/stats/ContactQualityCard";
import { CountSituationCards } from "@components/stats/CountSituationCards";
import { EraTrendChart } from "@components/stats/EraTrendChart";
import { FilterResetButton } from "@components/stats/FilterResetButton";
import { HeadlineStatsCard } from "@components/stats/HeadlineStatsCard";
import { HitDirectionTable } from "@components/stats/HitDirectionTable";
import { PeriodToggle } from "@components/stats/PeriodToggle";
import { PitcherAttributeSummary } from "@components/stats/PitcherAttributeSummary";
import { PitcherFaceoffList } from "@components/stats/PitcherFaceoffList";
import { PitchTypeCard } from "@components/stats/PitchTypeCard";
import { PlateAppearanceDonut } from "@components/stats/PlateAppearanceDonut";
import { ProComingSoonCard } from "@components/stats/ProComingSoonCard";
import {
  CountSituationDummy,
  PitcherFaceoffDummy,
  PitchTypeDummy,
} from "@components/stats/proComingSoonDummies";
import { ProComingSoonHitDirectionField } from "@components/stats/ProComingSoonHitDirectionField";
import { RunnersSituationCard } from "@components/stats/RunnersSituationCard";
import { SprayChart } from "@components/stats/SprayChart";
import { StatsFilters } from "@components/stats/StatsFilters";
import {
  StatsTable,
  BATTING_COLUMNS,
  PITCHING_COLUMNS,
} from "@components/stats/StatsTable";
import { TimingCard } from "@components/stats/TimingCard";
import {
  GlobalMenuButton,
  GlobalMenuOverlay,
  useGlobalMenu,
} from "@components/ui/GlobalMenu";
import { useAvailableYears } from "@hooks/useAvailableYears";
import { useEntitlement } from "@hooks/useEntitlement";
import { useMySeasons } from "@hooks/useSeasons";
import {
  useAdditionalStats,
  useBattingTrend,
  useContactQualities,
  useCountSituations,
  useHitDirections,
  useHitLocations,
  usePitchTypes,
  usePitcherAttributeSummary,
  usePitcherFaceoffs,
  usePlateAppearanceBreakdown,
  useBattingStatsTable,
  usePitchingStatsTable,
  useEraTrend,
  useHeadlineStats,
  useRunnersSituation,
  useTimingBreakdown,
} from "@hooks/useStats";
import { useTournaments } from "@hooks/useTournaments";
import {
  trackBattingTrendGranularityChanged,
  trackProFeatureTapped,
  trackStatsFilterChanged,
} from "@utils/analytics";

type ActiveTab = "batting" | "pitching";

const currentYear = new Date().getFullYear().toString();

// Pro プラン本体（課金・エンタイトルメント判定）実装時に false にすると、
// 対象4セクションが通常表示に戻り、停止していた hook の API 呼び出しが再開する。
const PRO_FEATURES_COMING_SOON = true;

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
  // フィルター変更時、変わったキーだけを計測してから state を更新する。
  const handleFiltersChange = useCallback(
    (next: StatsFiltersType) => {
      (["year", "matchType", "seasonId", "tournamentId"] as const).forEach(
        (key) => {
          if (filters[key] !== next[key]) {
            trackStatsFilterChanged({
              filter_key: key,
              filter_value: next[key] ?? null,
            });
          }
        },
      );
      setFilters(next);
    },
    [filters],
  );
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
  const hasTableFilter = !!(tableYear || tableSeasonId || tableTournamentId);
  const resetTableFilters = () => {
    setTableActiveFilter(null);
    setTableYear(undefined);
    setTableSeasonId(undefined);
    setTableTournamentId(undefined);
  };

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
  const countSituations = useCountSituations(
    filters,
    !PRO_FEATURES_COMING_SOON,
  );
  const contactQualities = useContactQualities(filters);
  const timingBreakdown = useTimingBreakdown(filters);
  const pitchTypes = usePitchTypes(filters, !PRO_FEATURES_COMING_SOON);
  const pitcherFaceoffs = usePitcherFaceoffs(
    filters,
    !PRO_FEATURES_COMING_SOON,
  );
  const pitcherAttributeSummary = usePitcherAttributeSummary(filters);
  const [battingTrendGranularity, setBattingTrendGranularity] =
    useState<BattingTrendGranularity>("game");
  const { hasEntitlement } = useEntitlement();
  const [seasonPaywallOpen, setSeasonPaywallOpen] = useState(false);
  const battingTrend = useBattingTrend(filters, battingTrendGranularity);
  const paBreakdown = usePlateAppearanceBreakdown(filters);
  const headlineStats = useHeadlineStats(filters);
  const additionalStats = useAdditionalStats(filters);
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

  // 画面右下の「トップに戻る」ボタン用。一定スクロールでフェードイン表示する。
  const scrollViewRef = useRef<ScrollView>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      setShowBackToTop(event.nativeEvent.contentOffset.y > 400);
    },
    [],
  );
  const scrollToTop = useCallback(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  }, []);

  const onRefresh = useCallback(async () => {
    setManualRefreshing(true);
    await Promise.all([
      hitDirections.refetch(),
      hitLocations.refetch(),
      contactQualities.refetch(),
      timingBreakdown.refetch(),
      // Coming soon 中は disabled な hook（countSituations / pitchTypes /
      // pitcherFaceoffs）を refetch しない。無駄な API 呼び出しを避ける。
      ...(PRO_FEATURES_COMING_SOON
        ? []
        : [
            countSituations.refetch(),
            pitchTypes.refetch(),
            pitcherFaceoffs.refetch(),
          ]),
      pitcherAttributeSummary.refetch(),
      battingTrend.refetch(),
      paBreakdown.refetch(),
      headlineStats.refetch(),
      additionalStats.refetch(),
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
    countSituations.refetch,
    contactQualities.refetch,
    timingBreakdown.refetch,
    pitchTypes.refetch,
    pitcherFaceoffs.refetch,
    pitcherAttributeSummary.refetch,
    battingTrend.refetch,
    paBreakdown.refetch,
    headlineStats.refetch,
    additionalStats.refetch,
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
        ref={scrollViewRef}
        style={styles.container}
        onScroll={handleScroll}
        scrollEventThrottle={64}
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
            onFiltersChange={handleFiltersChange}
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

        {/* Batting Tab */}
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
            {/* 3. AdditionalStatsCard（主要スタッツ以外の 16 項目） */}
            {additionalStats.data && (
              <FetchingOverlay isFetching={additionalStats.isFetching}>
                <AdditionalStatsCard data={additionalStats.data} />
              </FetchingOverlay>
            )}
            {/* 4. BattingTrendChart */}
            {battingTrend.data && (
              <FetchingOverlay isFetching={battingTrend.isFetching}>
                <BattingTrendChart
                  points={battingTrend.data.points}
                  granularity={battingTrendGranularity}
                  onGranularityChange={(next) => {
                    // シーズン粒度は Pro 限定。無料は Paywall を出して切替を止める。
                    if (
                      next === "season" &&
                      !hasEntitlement("season_transition_graph")
                    ) {
                      setSeasonPaywallOpen(true);
                      return;
                    }
                    trackBattingTrendGranularityChanged(next);
                    setBattingTrendGranularity(next);
                  }}
                />
              </FetchingOverlay>
            )}
            {/* 5. SprayChart */}
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
            {/* 6. HitDirectionTable */}
            {PRO_FEATURES_COMING_SOON ? (
              <ProComingSoonCard
                title="方向別の打率"
                description="打球を打った方向ごとの打率をヒートマップで可視化します"
                onPress={() => trackProFeatureTapped("hit_direction")}
              >
                <ProComingSoonHitDirectionField />
              </ProComingSoonCard>
            ) : (
              hitDirections.data && (
                <FetchingOverlay isFetching={hitDirections.isFetching}>
                  <HitDirectionTable
                    directions={hitDirections.data.directions}
                  />
                </FetchingOverlay>
              )
            )}
            {/* 7. PlateAppearanceDonut（打席結果の内訳） */}
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
            {/* 8. ContactQualityCard（打球の質） */}
            {contactQualities.data && (
              <FetchingOverlay isFetching={contactQualities.isFetching}>
                <ContactQualityCard
                  breakdown={contactQualities.data.breakdown}
                  total={contactQualities.data.total}
                />
              </FetchingOverlay>
            )}
            {/* 9. TimingCard（タイミング別の打席比率） */}
            {timingBreakdown.data && (
              <FetchingOverlay isFetching={timingBreakdown.isFetching}>
                <TimingCard
                  breakdown={timingBreakdown.data.breakdown}
                  total={timingBreakdown.data.total}
                />
              </FetchingOverlay>
            )}
            {/* 10. CountSituationCards（カウント別の打率） */}
            {PRO_FEATURES_COMING_SOON ? (
              <ProComingSoonCard
                title="カウント別の打率"
                description="初球・有利カウント・追い込みなど、カウント状況別の打率がわかります"
                onPress={() => trackProFeatureTapped("count_situation")}
              >
                <CountSituationDummy />
              </ProComingSoonCard>
            ) : (
              countSituations.data && (
                <FetchingOverlay isFetching={countSituations.isFetching}>
                  <CountSituationCards data={countSituations.data} />
                </FetchingOverlay>
              )
            )}
            {/* 11. PitchTypeCard（球種別の打率） */}
            {PRO_FEATURES_COMING_SOON ? (
              <ProComingSoonCard
                title="球種別の打率"
                description="ストレートや変化球など、球種ごとの得意・苦手が分析できます"
                onPress={() => trackProFeatureTapped("pitch_type")}
              >
                <PitchTypeDummy />
              </ProComingSoonCard>
            ) : (
              pitchTypes.data && (
                <FetchingOverlay isFetching={pitchTypes.isFetching}>
                  <PitchTypeCard
                    rows={pitchTypes.data.rows}
                    totalTargetPa={pitchTypes.data.total_target_pa}
                  />
                </FetchingOverlay>
              )
            )}
            {/* 12. PitcherFaceoffList */}
            {PRO_FEATURES_COMING_SOON ? (
              <ProComingSoonCard
                title="対戦投手別"
                description="対戦した投手ごとの打撃成績を一覧で確認できます"
                onPress={() => trackProFeatureTapped("pitcher_faceoff")}
              >
                <PitcherFaceoffDummy />
              </ProComingSoonCard>
            ) : (
              pitcherFaceoffs.data && (
                <FetchingOverlay isFetching={pitcherFaceoffs.isFetching}>
                  <PitcherFaceoffList
                    rows={pitcherFaceoffs.data.rows}
                    minPlateAppearances={
                      pitcherFaceoffs.data.min_plate_appearances
                    }
                    totalTargetPa={pitcherFaceoffs.data.total_target_pa}
                  />
                </FetchingOverlay>
              )
            )}
            {/* 13. PitcherAttributeSummary */}
            {pitcherAttributeSummary.data && (
              <FetchingOverlay isFetching={pitcherAttributeSummary.isFetching}>
                <PitcherAttributeSummary data={pitcherAttributeSummary.data} />
              </FetchingOverlay>
            )}
            {/* 14. 打撃成績テーブル（最下部） */}
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
                <FilterResetButton
                  visible={hasTableFilter}
                  onPress={resetTableFilters}
                />
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
                <FilterResetButton
                  visible={hasTableFilter}
                  onPress={resetTableFilters}
                />
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

      {showBackToTop && (
        <Pressable
          onPress={scrollToTop}
          style={styles.backToTopButton}
          accessibilityRole="button"
          accessibilityLabel="画面のトップに戻る"
        >
          <Ionicons name="chevron-up" size={20} color="#F4F4F4" />
        </Pressable>
      )}

      <GlobalMenuOverlay
        visible={menuVisible}
        opacity={menuOpacity}
        onClose={closeMenu}
      />

      <PaywallModal
        isOpen={seasonPaywallOpen}
        onClose={() => setSeasonPaywallOpen(false)}
        feature="season_transition_graph"
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
  backToTopButton: {
    position: "absolute",
    right: 16,
    bottom: 24,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#d08000",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
});

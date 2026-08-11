import type { StatsFilters as StatsFiltersType } from "../../types/profile";
import type {
  BattingTrendGranularity,
  EraTrendGranularity,
  PitcherFaceoff,
  PitchTypeRow,
  StatsPeriod,
} from "../../types/stats";
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
import { AppBannerAd } from "@components/ads/AppBannerAd";
import { InlineBannerAd } from "@components/ads/InlineBannerAd";
import { PaywallModal } from "@components/pro/PaywallModal";
import { ProUpsellCard } from "@components/pro/ProUpsellCard";
import { ProUpsellOverlay } from "@components/pro/ProUpsellOverlay";
import { SampleDataLabel } from "@components/pro/SampleDataLabel";
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
import { CountSituationDummy } from "@components/stats/proComingSoonDummies";
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
import { SwipeableTabPages } from "@components/ui/SwipeableTabPages";
import { useAvailableMonths } from "@hooks/useAvailableMonths";
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
import { monthOptionsFromRecorded } from "@utils/monthOptions";

type ActiveTab = "batting" | "pitching";

const TABS: { key: ActiveTab; label: string }[] = [
  { key: "batting", label: "打撃" },
  { key: "pitching", label: "投球" },
];
const TAB_KEYS = TABS.map((tab) => tab.key);

const currentYear = new Date().getFullYear().toString();

// 球種別・対戦投手別は実コンポーネント（PitchTypeCard/PitcherFaceoffList）に
// サンプルデータを渡すことで、タップして詳細スタッツを展開できる操作感も
// 無料ユーザーのサンプル表示のまま体験できるようにする。
const DUMMY_PITCH_TYPE_ROWS: PitchTypeRow[] = [
  {
    id: 1,
    label: "ストレート",
    plate_appearances: 40,
    at_bats: 35,
    hits: 12,
    total_bases: 18,
    base_on_balls: 4,
    hit_by_pitch: 1,
    sacrifice_fly: 0,
    batting_average: 0.342,
    on_base_percentage: 0.425,
    slugging_percentage: 0.514,
    ops: 0.939,
    result_counts: [
      { plate_result_id: 1, plate_result_name: "二塁打", count: 3 },
      { plate_result_id: 2, plate_result_name: "三塁打", count: 0 },
      { plate_result_id: 3, plate_result_name: "本塁打", count: 1 },
      { plate_result_id: 4, plate_result_name: "三振", count: 6 },
    ],
  },
  {
    id: 2,
    label: "スライダー",
    plate_appearances: 28,
    at_bats: 25,
    hits: 6,
    total_bases: 7,
    base_on_balls: 2,
    hit_by_pitch: 0,
    sacrifice_fly: 0,
    batting_average: 0.24,
    on_base_percentage: 0.296,
    slugging_percentage: 0.28,
    ops: 0.576,
    result_counts: [
      { plate_result_id: 1, plate_result_name: "二塁打", count: 1 },
      { plate_result_id: 2, plate_result_name: "三塁打", count: 0 },
      { plate_result_id: 3, plate_result_name: "本塁打", count: 0 },
      { plate_result_id: 4, plate_result_name: "三振", count: 9 },
    ],
  },
  {
    id: 3,
    label: "カーブ",
    plate_appearances: 15,
    at_bats: 14,
    hits: 3,
    total_bases: 3,
    base_on_balls: 1,
    hit_by_pitch: 0,
    sacrifice_fly: 0,
    batting_average: 0.214,
    on_base_percentage: 0.267,
    slugging_percentage: 0.214,
    ops: 0.481,
    result_counts: [
      { plate_result_id: 1, plate_result_name: "二塁打", count: 0 },
      { plate_result_id: 2, plate_result_name: "三塁打", count: 0 },
      { plate_result_id: 3, plate_result_name: "本塁打", count: 0 },
      { plate_result_id: 4, plate_result_name: "三振", count: 5 },
    ],
  },
  {
    id: 4,
    label: "フォーク",
    plate_appearances: 12,
    at_bats: 11,
    hits: 5,
    total_bases: 6,
    base_on_balls: 1,
    hit_by_pitch: 0,
    sacrifice_fly: 0,
    batting_average: 0.455,
    on_base_percentage: 0.5,
    slugging_percentage: 0.545,
    ops: 1.045,
    result_counts: [
      { plate_result_id: 1, plate_result_name: "二塁打", count: 1 },
      { plate_result_id: 2, plate_result_name: "三塁打", count: 0 },
      { plate_result_id: 3, plate_result_name: "本塁打", count: 0 },
      { plate_result_id: 4, plate_result_name: "三振", count: 2 },
    ],
  },
  {
    id: 5,
    label: "チェンジアップ",
    plate_appearances: 8,
    at_bats: 7,
    hits: 1,
    total_bases: 1,
    base_on_balls: 1,
    hit_by_pitch: 0,
    sacrifice_fly: 0,
    batting_average: 0.143,
    on_base_percentage: 0.25,
    slugging_percentage: 0.143,
    ops: 0.393,
    result_counts: [
      { plate_result_id: 1, plate_result_name: "二塁打", count: 0 },
      { plate_result_id: 2, plate_result_name: "三塁打", count: 0 },
      { plate_result_id: 3, plate_result_name: "本塁打", count: 0 },
      { plate_result_id: 4, plate_result_name: "三振", count: 3 },
    ],
  },
];
const DUMMY_PITCH_TYPE_TOTAL_PA = DUMMY_PITCH_TYPE_ROWS.reduce(
  (sum, row) => sum + row.plate_appearances,
  0,
);

const DUMMY_PITCHER_FACEOFF_ROWS: PitcherFaceoff[] = [
  {
    pitcher_id: 1,
    pitcher_name: "投手 A",
    team_name: "〇〇高校",
    throw_hand: "right",
    pitcher_style: "パワーピッチャー",
    velocity_zone: "140km/h台",
    plate_appearances: 12,
    at_bats: 11,
    hits: 5,
    total_bases: 7,
    base_on_balls: 1,
    hit_by_pitch: 0,
    sacrifice_fly: 0,
    batting_average: 0.455,
    on_base_percentage: 0.5,
    slugging_percentage: 0.636,
    ops: 1.136,
    top_result: "単打",
    result_counts: [
      { plate_result_id: 1, plate_result_name: "二塁打", count: 2 },
      { plate_result_id: 2, plate_result_name: "三塁打", count: 0 },
      { plate_result_id: 3, plate_result_name: "本塁打", count: 0 },
      { plate_result_id: 4, plate_result_name: "三振", count: 3 },
    ],
  },
  {
    pitcher_id: 2,
    pitcher_name: "投手 B",
    team_name: "△△高校",
    throw_hand: "left",
    pitcher_style: "技巧派",
    velocity_zone: "120km/h台",
    plate_appearances: 10,
    at_bats: 10,
    hits: 3,
    total_bases: 3,
    base_on_balls: 0,
    hit_by_pitch: 0,
    sacrifice_fly: 0,
    batting_average: 0.3,
    on_base_percentage: 0.3,
    slugging_percentage: 0.3,
    ops: 0.6,
    top_result: "単打",
    result_counts: [
      { plate_result_id: 1, plate_result_name: "二塁打", count: 0 },
      { plate_result_id: 2, plate_result_name: "三塁打", count: 0 },
      { plate_result_id: 3, plate_result_name: "本塁打", count: 0 },
      { plate_result_id: 4, plate_result_name: "三振", count: 4 },
    ],
  },
  {
    pitcher_id: 3,
    pitcher_name: "投手 C",
    team_name: "□□高校",
    throw_hand: "right",
    pitcher_style: "パワーピッチャー",
    velocity_zone: "130km/h台",
    plate_appearances: 9,
    at_bats: 9,
    hits: 2,
    total_bases: 2,
    base_on_balls: 0,
    hit_by_pitch: 0,
    sacrifice_fly: 0,
    batting_average: 0.222,
    on_base_percentage: 0.222,
    slugging_percentage: 0.222,
    ops: 0.444,
    top_result: "単打",
    result_counts: [
      { plate_result_id: 1, plate_result_name: "二塁打", count: 0 },
      { plate_result_id: 2, plate_result_name: "三塁打", count: 0 },
      { plate_result_id: 3, plate_result_name: "本塁打", count: 0 },
      { plate_result_id: 4, plate_result_name: "三振", count: 5 },
    ],
  },
];
const DUMMY_PITCHER_FACEOFF_TOTAL_PA = DUMMY_PITCHER_FACEOFF_ROWS.reduce(
  (sum, row) => sum + row.plate_appearances,
  0,
);
const DUMMY_PITCHER_FACEOFF_MIN_PA = 5;

/**
 * pro/status解決前（isProLoading中）の中立プレースホルダー。
 * ProUpsellOverlayのwrapperWithCard相当の高さを確保し、判定確定後に
 * ロック/実データいずれかへ切り替わってもレイアウトシフトが起きないようにする。
 */
function ProSectionLoadingPlaceholder() {
  return (
    <View style={[styles.proSectionSpacing, styles.proSectionLoading]}>
      <ActivityIndicator size="small" color="#d08000" />
    </View>
  );
}

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
  // 「全て」以外を選択中は primary で強調し、絞り込み中だと一目で分かるようにする。
  const isFiltered = value !== undefined;

  return (
    <View style={{ zIndex: isOpen ? 100 : 0 }}>
      <TouchableOpacity
        style={[
          tableFilterStyles.button,
          isFiltered && tableFilterStyles.buttonActive,
        ]}
        onPress={onToggle}
      >
        <Text
          style={[
            tableFilterStyles.buttonText,
            isFiltered && tableFilterStyles.buttonTextActive,
          ]}
        >
          {label}: {selectedLabel}
        </Text>
        <Ionicons
          name="chevron-down"
          size={14}
          color={isFiltered ? "#d08000" : "#A1A1AA"}
        />
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
  buttonActive: { borderColor: "#d08000" },
  buttonTextActive: { color: "#d08000" },
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
  // 面ごとに独立した ScrollView を持つため、トップに戻す対象も面ごとに保持する。
  const battingScrollRef = useRef<ScrollView>(null);
  const pitchingScrollRef = useRef<ScrollView>(null);
  const [filters, setFilters] = useState<StatsFiltersType>({});
  // フィルター変更時、変わったキーだけを計測してから state を更新する。
  const handleFiltersChange = useCallback(
    (next: StatsFiltersType) => {
      (
        [
          "year",
          "matchType",
          "seasonId",
          "tournamentId",
          "startMonth",
          "endMonth",
        ] as const
      ).forEach((key) => {
        if (filters[key] !== next[key]) {
          trackStatsFilterChanged({
            filter_key: key,
            filter_value: next[key] ?? null,
          });
        }
      });
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
  const [tableStartMonth, setTableStartMonth] = useState<string | undefined>(
    undefined,
  );
  const [tableEndMonth, setTableEndMonth] = useState<string | undefined>(
    undefined,
  );
  const [tableActiveFilter, setTableActiveFilter] = useState<string | null>(
    null,
  );
  const toggleTableFilter = (id: string) =>
    setTableActiveFilter((prev) => (prev === id ? null : id));
  const hasTableFilter = !!(
    tableYear ||
    tableSeasonId ||
    tableTournamentId ||
    tableStartMonth ||
    tableEndMonth
  );
  const resetTableFilters = () => {
    setTableActiveFilter(null);
    setTableYear(undefined);
    setTableSeasonId(undefined);
    setTableTournamentId(undefined);
    setTableStartMonth(undefined);
    setTableEndMonth(undefined);
  };

  // 年度と期間は排他。実年を選んだら期間をクリアする。
  const handleTableYearSelect = (value: string | undefined) => {
    setTableYear(value);
    if (value) {
      setTableStartMonth(undefined);
      setTableEndMonth(undefined);
    }
  };

  // 開始を選ぶと終了が未指定/開始より前のとき終了を同月に合わせ、単月をワンタップで作れる。
  const handleTableStartMonthSelect = (value: string | undefined) => {
    if (!value) {
      setTableStartMonth(undefined);
      return;
    }
    setTableStartMonth(value);
    setTableEndMonth((prev) => (!prev || prev < value ? value : prev));
    setTableYear(undefined);
  };

  const handleTableEndMonthSelect = (value: string | undefined) => {
    if (!value) {
      setTableEndMonth(undefined);
      return;
    }
    setTableEndMonth(value);
    setTableStartMonth((prev) => (prev && prev > value ? value : prev));
    setTableYear(undefined);
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
  const { months } = useAvailableMonths();
  const { hasEntitlement, isLoading: isProLoading } = useEntitlement();
  // 打球方向の生データは無料機能のSprayChartでも使うため、Pro判定に関わらず常時取得する
  // （Proでロックするのはhit_directionsのデータそのものではなく、詳細内訳テーブルの表示のみ）。
  const hitDirections = useHitDirections(filters);
  const hitLocations = useHitLocations(filters);
  const countSituations = useCountSituations(
    filters,
    hasEntitlement("count_situation_average"),
  );
  const contactQualities = useContactQualities(filters);
  const timingBreakdown = useTimingBreakdown(filters);
  const pitchTypes = usePitchTypes(
    filters,
    hasEntitlement("pitch_type_average"),
  );
  const pitcherFaceoffs = usePitcherFaceoffs(
    filters,
    hasEntitlement("pitcher_faceoff_average"),
  );
  const pitcherAttributeSummary = usePitcherAttributeSummary(filters);
  const [battingTrendGranularity, setBattingTrendGranularity] =
    useState<BattingTrendGranularity>("game");
  const [eraTrendGranularity, setEraTrendGranularity] =
    useState<EraTrendGranularity>("month");
  const [seasonPaywallOpen, setSeasonPaywallOpen] = useState(false);
  const [comingSoonPaywallOpen, setComingSoonPaywallOpen] = useState(false);
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
    tableStartMonth,
    tableEndMonth,
  );
  const pitchingTable = usePitchingStatsTable(
    pitchingPeriod,
    tableYear,
    tableSeasonId,
    tableTournamentId,
    tableStartMonth,
    tableEndMonth,
  );
  const eraTrend = useEraTrend(
    filters.year,
    filters.seasonId,
    filters.tournamentId,
    activeTab === "pitching",
    filters.startMonth,
    filters.endMonth,
    eraTrendGranularity,
  );
  const isLoading =
    hitDirections.isLoading ||
    paBreakdown.isLoading ||
    battingTable.isLoading ||
    pitchingTable.isLoading ||
    eraTrend.isLoading;

  const [manualRefreshing, setManualRefreshing] = useState(false);

  // 画面右下の「トップに戻る」ボタン用。一定スクロールでフェードイン表示する。

  const [showBackToTop, setShowBackToTop] = useState(false);
  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      setShowBackToTop(event.nativeEvent.contentOffset.y > 400);
    },
    [],
  );
  const scrollToTop = useCallback(() => {
    const target =
      activeTab === "batting" ? battingScrollRef : pitchingScrollRef;
    target.current?.scrollTo({ y: 0, animated: true });
  }, [activeTab]);

  const onRefresh = useCallback(async () => {
    setManualRefreshing(true);
    await Promise.all([
      hitDirections.refetch(),
      hitLocations.refetch(),
      contactQualities.refetch(),
      timingBreakdown.refetch(),
      // 無料ユーザーには enabled: false で止めている hook（countSituations /
      // pitchTypes / pitcherFaceoffs）を refetch しない。無駄な API 呼び出しを避ける。
      ...(hasEntitlement("count_situation_average")
        ? [countSituations.refetch()]
        : []),
      ...(hasEntitlement("pitch_type_average") ? [pitchTypes.refetch()] : []),
      ...(hasEntitlement("pitcher_faceoff_average")
        ? [pitcherFaceoffs.refetch()]
        : []),
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
    hasEntitlement,
  ]);

  const handleBattingPeriodChange = useCallback(
    (period: StatsPeriod) => {
      setBattingPeriod(period);
      // 期間フィルタが有効なときは年度への自動フォールバックで排他を崩さない。
      if (
        period !== "yearly" &&
        !tableYear &&
        !tableSeasonId &&
        !tableStartMonth &&
        !tableEndMonth
      ) {
        setTableYear(currentYear);
      }
    },
    [tableYear, tableSeasonId, tableStartMonth, tableEndMonth],
  );

  const handlePitchingPeriodChange = useCallback(
    (period: StatsPeriod) => {
      setPitchingPeriod(period);
      // 期間フィルタが有効なときは年度への自動フォールバックで排他を崩さない。
      if (
        period !== "yearly" &&
        !tableYear &&
        !tableSeasonId &&
        !tableStartMonth &&
        !tableEndMonth
      ) {
        setTableYear(currentYear);
      }
    },
    [tableYear, tableSeasonId, tableStartMonth, tableEndMonth],
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

  const monthOptions = monthOptionsFromRecorded(months);

  const currentPeriod =
    activeTab === "batting" ? battingPeriod : pitchingPeriod;
  const showTableFilters = currentPeriod !== "yearly";

  const hasNoData =
    !hitDirections.data &&
    !paBreakdown.data &&
    !battingTable.data &&
    !pitchingTable.data &&
    !eraTrend.data;

  const renderStatsPage = (key: ActiveTab) => (
    <ScrollView
      ref={key === "batting" ? battingScrollRef : pitchingScrollRef}
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
      {key === "batting" ? (
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
          {hasEntitlement("hit_direction_average") ? (
            hitDirections.data && (
              <FetchingOverlay isFetching={hitDirections.isFetching}>
                <HitDirectionTable directions={hitDirections.data.directions} />
              </FetchingOverlay>
            )
          ) : (
            <ProUpsellOverlay
              unlocked={false}
              loading={isProLoading}
              feature="hit_direction_average"
              onPressCta={() => {
                trackProFeatureTapped("hit_direction");
                setComingSoonPaywallOpen(true);
              }}
              style={styles.proSectionSpacing}
            >
              <ProComingSoonHitDirectionField />
            </ProUpsellOverlay>
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
          {/* pro/status 解決前は hasEntitlement が false 倒しになり、Pro ユーザーへ
                  一瞬サンプル表示がフラッシュしてしまうため、判定確定まではProUpsellOverlay
                  と同様に高さを確保した中立表示にし、判定確定後のレイアウトシフトを抑える。 */}
          {isProLoading ? (
            <ProSectionLoadingPlaceholder />
          ) : hasEntitlement("count_situation_average") ? (
            countSituations.data && (
              <FetchingOverlay isFetching={countSituations.isFetching}>
                <CountSituationCards data={countSituations.data} />
              </FetchingOverlay>
            )
          ) : (
            <View style={styles.proSectionSpacing}>
              <ProUpsellCard
                feature="count_situation_average"
                onPressCta={() => {
                  trackProFeatureTapped("count_situation");
                  setComingSoonPaywallOpen(true);
                }}
              />
              <SampleDataLabel />
              <View pointerEvents="none" style={styles.comingSoonDummy}>
                <CountSituationDummy />
              </View>
            </View>
          )}
          {/* 11. PitchTypeCard（球種別の打率） */}
          {isProLoading ? (
            <ProSectionLoadingPlaceholder />
          ) : hasEntitlement("pitch_type_average") ? (
            pitchTypes.data && (
              <FetchingOverlay isFetching={pitchTypes.isFetching}>
                <PitchTypeCard
                  rows={pitchTypes.data.rows}
                  totalTargetPa={pitchTypes.data.total_target_pa}
                />
              </FetchingOverlay>
            )
          ) : (
            <View style={styles.proSectionSpacing}>
              <ProUpsellCard
                feature="pitch_type_average"
                onPressCta={() => {
                  trackProFeatureTapped("pitch_type");
                  setComingSoonPaywallOpen(true);
                }}
              />
              <SampleDataLabel />
              {/* タップした時に詳細スタッツを展開するPro機能もサンプルで体験できるよう、
                      ダミーの静的リストではなく実コンポーネントにサンプルデータを渡す。 */}
              <View style={styles.comingSoonDummy}>
                <PitchTypeCard
                  rows={DUMMY_PITCH_TYPE_ROWS}
                  totalTargetPa={DUMMY_PITCH_TYPE_TOTAL_PA}
                />
              </View>
            </View>
          )}
          {/* 12. PitcherFaceoffList */}
          {isProLoading ? (
            <ProSectionLoadingPlaceholder />
          ) : hasEntitlement("pitcher_faceoff_average") ? (
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
          ) : (
            <View style={styles.proSectionSpacing}>
              <ProUpsellCard
                feature="pitcher_faceoff_average"
                onPressCta={() => {
                  trackProFeatureTapped("pitcher_faceoff");
                  setComingSoonPaywallOpen(true);
                }}
              />
              <SampleDataLabel />
              <View style={styles.comingSoonDummy}>
                <PitcherFaceoffList
                  rows={DUMMY_PITCHER_FACEOFF_ROWS}
                  minPlateAppearances={DUMMY_PITCHER_FACEOFF_MIN_PA}
                  totalTargetPa={DUMMY_PITCHER_FACEOFF_TOTAL_PA}
                />
              </View>
            </View>
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
                onSelect={handleTableYearSelect}
                isOpen={tableActiveFilter === `${key}-tableYear`}
                onToggle={() => toggleTableFilter(`${key}-tableYear`)}
              />
              {monthOptions.length > 0 && (
                <>
                  <TableFilterDropdown
                    label="開始"
                    value={tableStartMonth}
                    options={monthOptions}
                    onSelect={handleTableStartMonthSelect}
                    isOpen={tableActiveFilter === `${key}-tableStartMonth`}
                    onToggle={() => toggleTableFilter(`${key}-tableStartMonth`)}
                  />
                  <TableFilterDropdown
                    label="終了"
                    value={tableEndMonth}
                    options={monthOptions}
                    onSelect={handleTableEndMonthSelect}
                    isOpen={tableActiveFilter === `${key}-tableEndMonth`}
                    onToggle={() => toggleTableFilter(`${key}-tableEndMonth`)}
                  />
                </>
              )}
              {seasonOptions.length > 0 && (
                <TableFilterDropdown
                  label="シーズン"
                  value={tableSeasonId}
                  options={seasonOptions}
                  onSelect={setTableSeasonId}
                  isOpen={tableActiveFilter === `${key}-tableSeason`}
                  onToggle={() => toggleTableFilter(`${key}-tableSeason`)}
                />
              )}
              {tournamentOptions.length > 0 && (
                <TableFilterDropdown
                  label="大会"
                  value={tableTournamentId}
                  options={tournamentOptions}
                  onSelect={setTableTournamentId}
                  isOpen={tableActiveFilter === `${key}-tableTournament`}
                  onToggle={() => toggleTableFilter(`${key}-tableTournament`)}
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
      ) : (
        <View style={styles.content}>
          {eraTrend.data && eraTrend.data.points.length > 0 && (
            <FetchingOverlay isFetching={eraTrend.isFetching}>
              <EraTrendChart
                points={eraTrend.data.points}
                granularity={eraTrendGranularity}
                onGranularityChange={(next) => {
                  // シーズン粒度は Pro 限定。無料は Paywall を出して切替を止める。
                  if (
                    next === "season" &&
                    !hasEntitlement("season_transition_graph")
                  ) {
                    setSeasonPaywallOpen(true);
                    return;
                  }
                  setEraTrendGranularity(next);
                }}
              />
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
                onSelect={handleTableYearSelect}
                isOpen={tableActiveFilter === `${key}-tableYear`}
                onToggle={() => toggleTableFilter(`${key}-tableYear`)}
              />
              {monthOptions.length > 0 && (
                <>
                  <TableFilterDropdown
                    label="開始"
                    value={tableStartMonth}
                    options={monthOptions}
                    onSelect={handleTableStartMonthSelect}
                    isOpen={tableActiveFilter === `${key}-tableStartMonth`}
                    onToggle={() => toggleTableFilter(`${key}-tableStartMonth`)}
                  />
                  <TableFilterDropdown
                    label="終了"
                    value={tableEndMonth}
                    options={monthOptions}
                    onSelect={handleTableEndMonthSelect}
                    isOpen={tableActiveFilter === `${key}-tableEndMonth`}
                    onToggle={() => toggleTableFilter(`${key}-tableEndMonth`)}
                  />
                </>
              )}
              {seasonOptions.length > 0 && (
                <TableFilterDropdown
                  label="シーズン"
                  value={tableSeasonId}
                  options={seasonOptions}
                  onSelect={setTableSeasonId}
                  isOpen={tableActiveFilter === `${key}-tableSeason`}
                  onToggle={() => toggleTableFilter(`${key}-tableSeason`)}
                />
              )}
              {tournamentOptions.length > 0 && (
                <TableFilterDropdown
                  label="大会"
                  value={tableTournamentId}
                  options={tournamentOptions}
                  onSelect={setTableTournamentId}
                  isOpen={tableActiveFilter === `${key}-tableTournament`}
                  onToggle={() => toggleTableFilter(`${key}-tableTournament`)}
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
      {key === activeTab ? <InlineBannerAd placement="stats" /> : null}
    </ScrollView>
  );

  if (hasNoData && isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#d08000" />
      </View>
    );
  }

  return (
    <>
      <View style={styles.fixedHeader}>
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
            availableMonths={months}
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
      </View>

      <SwipeableTabPages
        tabKeys={TAB_KEYS}
        activeKey={activeTab}
        onChange={setActiveTab}
        renderPage={renderStatsPage}
      />

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

      <AppBannerAd />
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
      <PaywallModal
        isOpen={comingSoonPaywallOpen}
        onClose={() => setComingSoonPaywallOpen(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  fixedHeader: { backgroundColor: "#2E2E2E" },
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
  proSectionSpacing: {
    marginBottom: 16,
  },
  proSectionLoading: {
    minHeight: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  comingSoonDummy: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#52525B",
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

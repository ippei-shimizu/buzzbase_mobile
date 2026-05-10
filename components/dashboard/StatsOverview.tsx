import type { BattingStats, PitchingStats } from "../../types/dashboard";
import type { StatsFilters } from "../../types/profile";
import React, { useState } from "react";
import { View, Text, StyleSheet, type ViewStyle } from "react-native";
import { SummaryStatsTable } from "@components/stats/SummaryStatsTable";
import {
  FilterDropdown,
  MATCH_TYPE_OPTIONS,
} from "@components/ui/FilterDropdown";
import { useAvailableYears } from "@hooks/useAvailableYears";
import { useProfileStats } from "@hooks/useProfileStats";
import { useMySeasons } from "@hooks/useSeasons";
import { useTournaments } from "@hooks/useTournaments";
import { formatRate, formatEra } from "@utils/formatStats";
import {
  normalizeBattingStats,
  normalizePitchingStats,
} from "@utils/radarChartUtils";
import { EmptyState } from "./EmptyState";
import { StatsRadarChart } from "./StatsRadarChart";

interface StatsOverviewProps {
  battingStats: BattingStats;
  pitchingStats: PitchingStats;
  style?: ViewStyle;
}

function formatStat(value: number | undefined | null, decimals = 3): string {
  if (value == null) return "-";
  if (decimals === 3) return formatRate(value);
  if (decimals === 2) return formatEra(value);
  return value.toFixed(decimals);
}

// --- Sections ---

const BattingSection = ({
  stats,
  filterBar,
}: {
  stats: BattingStats;
  filterBar: React.ReactNode;
}) => {
  const radarData = normalizeBattingStats(stats);
  const { aggregate: agg, calculated: calc } = stats;

  return (
    <>
      <View style={styles.sectionTitleRow}>
        <Text style={styles.sectionTitle}>打撃成績</Text>
      </View>
      {filterBar}

      {!agg || !calc ? (
        <EmptyState title="打撃データがありません" />
      ) : (
        <>
          {radarData.length > 0 && (
            <StatsRadarChart data={radarData} color="#d08000" title="打撃" />
          )}

          <View style={styles.headline}>
            <Text style={styles.headlineRow}>
              <Text style={styles.headlineLabel}>打率 </Text>
              <Text style={styles.headlineValue}>
                {formatStat(calc.batting_average)}
              </Text>
              <Text style={styles.headlineSub}>
                {"  "}
                {agg.number_of_matches}試合
              </Text>
            </Text>
            <Text style={styles.headlineSummary}>
              {agg.times_at_bat}打席 {agg.at_bats}打数 {agg.hit}安打 /{" "}
              {agg.runs_batted_in}打点 {agg.home_run}本塁打
            </Text>
          </View>

          <SummaryStatsTable
            rows={[
              [
                "打率",
                formatStat(calc.batting_average),
                "試合",
                agg.number_of_matches ?? "-",
              ],
              ["打席", agg.times_at_bat ?? "-", "打数", agg.at_bats ?? "-"],
              ["安打", agg.hit ?? "-", "二塁打", agg.two_base_hit ?? "-"],
              [
                "三塁打",
                agg.three_base_hit ?? "-",
                "本塁打",
                agg.home_run ?? "-",
              ],
              [
                "塁打",
                agg.total_bases ?? "-",
                "打点",
                agg.runs_batted_in ?? "-",
              ],
              ["得点", agg.run ?? "-", "三振", agg.strike_out ?? "-"],
              [
                "四球",
                agg.base_on_balls ?? "-",
                "死球",
                agg.hit_by_pitch ?? "-",
              ],
              [
                "犠打",
                agg.sacrifice_hit ?? "-",
                "犠飛",
                agg.sacrifice_fly ?? "-",
              ],
              [
                "盗塁",
                agg.stealing_base ?? "-",
                "盗塁死",
                agg.caught_stealing ?? "-",
              ],
              [
                "出塁率",
                formatStat(calc.on_base_percentage),
                "長打率",
                formatStat(calc.slugging_percentage),
              ],
              ["OPS", formatStat(calc.ops), "ISO", formatStat(calc.iso)],
              [
                "ISOD",
                formatStat(calc.isod),
                "BB/K",
                formatStat(calc.bb_per_k),
              ],
            ]}
          />
        </>
      )}
    </>
  );
};

const PitchingSection = ({
  stats,
  filterBar,
}: {
  stats: PitchingStats;
  filterBar: React.ReactNode;
}) => {
  const radarData = normalizePitchingStats(stats);
  const { aggregate: pAgg, calculated: pCalc } = stats;

  return (
    <>
      <View style={styles.sectionTitleRow}>
        <Text style={styles.sectionTitle}>投手成績</Text>
      </View>
      {filterBar}

      {!pAgg || !pCalc ? (
        <EmptyState title="投手データがありません" />
      ) : (
        <>
          {radarData.length > 0 && (
            <StatsRadarChart data={radarData} color="#338EF7" title="投手" />
          )}

          <View style={styles.headline}>
            <Text style={styles.headlineRow}>
              <Text style={styles.headlineLabel}>防御率 </Text>
              <Text style={styles.headlineValue}>
                {formatStat(pCalc.era, 2)}
              </Text>
              <Text style={styles.headlineSub}>
                {"  "}
                {pAgg.number_of_appearances}登板
              </Text>
            </Text>
            <Text style={styles.headlineSummary}>
              {pAgg.win}勝 {pAgg.loss}敗 / {pAgg.innings_pitched}回{" "}
              {pAgg.strikeouts}奪三振
            </Text>
          </View>

          <SummaryStatsTable
            rows={[
              [
                "防御率",
                formatStat(pCalc.era, 2),
                "登板",
                pAgg.number_of_appearances ?? "-",
              ],
              ["勝", pAgg.win ?? "-", "敗", pAgg.loss ?? "-"],
              [
                "投球回",
                pAgg.innings_pitched ?? "-",
                "完投",
                pAgg.complete_games ?? "-",
              ],
              ["完封", pAgg.shutouts ?? "-", "セーブ", pAgg.saves ?? "-"],
              ["ホールド", pAgg.hold ?? "-", "奪三振", pAgg.strikeouts ?? "-"],
              [
                "与四球",
                pAgg.base_on_balls ?? "-",
                "与死球",
                pAgg.hit_by_pitch ?? "-",
              ],
              [
                "被安打",
                pAgg.hits_allowed ?? "-",
                "被本塁打",
                pAgg.home_runs_hit ?? "-",
              ],
              [
                "失点",
                pAgg.run_allowed ?? "-",
                "自責点",
                pAgg.earned_run ?? "-",
              ],
              [
                "勝率",
                formatStat(pCalc.win_percentage),
                "WHIP",
                formatStat(pCalc.whip, 2),
              ],
              [
                "K/9",
                formatStat(pCalc.k_per_nine, 2),
                "BB/9",
                formatStat(pCalc.bb_per_nine, 2),
              ],
              ["K/BB", formatStat(pCalc.k_bb, 2), "", ""],
            ]}
          />
        </>
      )}
    </>
  );
};

// --- Main ---

function useStatsFilter(prefix: string) {
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

  const hasFilters = !!(
    selectedYear ||
    selectedMatchType ||
    selectedSeasonId ||
    selectedTournamentId
  );

  const filters: StatsFilters = {
    ...(selectedYear ? { year: selectedYear } : {}),
    ...(selectedMatchType ? { matchType: selectedMatchType } : {}),
    ...(selectedSeasonId ? { seasonId: selectedSeasonId } : {}),
    ...(selectedTournamentId ? { tournamentId: selectedTournamentId } : {}),
  };

  return {
    selectedYear,
    setSelectedYear,
    selectedMatchType,
    setSelectedMatchType,
    selectedSeasonId,
    setSelectedSeasonId,
    selectedTournamentId,
    setSelectedTournamentId,
    activeFilter,
    toggleFilter,
    hasFilters,
    filters,
    prefix,
  };
}

export const StatsOverview = ({
  battingStats: defaultBatting,
  pitchingStats: defaultPitching,
  style,
}: StatsOverviewProps) => {
  const batting = useStatsFilter("batting");
  const pitching = useStatsFilter("pitching");

  const { battingStats: filteredBatting } = useProfileStats(batting.filters);
  const { pitchingStats: filteredPitching } = useProfileStats(pitching.filters);

  const { seasons } = useMySeasons();
  const { tournaments } = useTournaments();
  const { years: availableYears } = useAvailableYears();

  const battingStats =
    batting.hasFilters && filteredBatting ? filteredBatting : defaultBatting;
  const pitchingStats =
    pitching.hasFilters && filteredPitching
      ? filteredPitching
      : defaultPitching;

  const buildFilterBar = (f: ReturnType<typeof useStatsFilter>) => (
    <View style={styles.filterRow}>
      <FilterDropdown
        label="年度"
        value={f.selectedYear}
        options={[
          { key: "all", label: "通算" },
          ...availableYears.map((y) => ({ key: y, label: y })),
        ]}
        onSelect={(v) => f.setSelectedYear(v === "all" ? undefined : v)}
        isOpen={f.activeFilter === "year"}
        onToggle={() => f.toggleFilter("year")}
      />
      <FilterDropdown
        label="種別"
        value={f.selectedMatchType}
        options={MATCH_TYPE_OPTIONS}
        onSelect={f.setSelectedMatchType}
        isOpen={f.activeFilter === "matchType"}
        onToggle={() => f.toggleFilter("matchType")}
      />
      <FilterDropdown
        label="シーズン"
        value={f.selectedSeasonId}
        options={seasons.map((s) => ({
          key: String(s.id),
          label: s.name,
        }))}
        onSelect={f.setSelectedSeasonId}
        isOpen={f.activeFilter === "season"}
        onToggle={() => f.toggleFilter("season")}
      />
      {tournaments.length > 0 && (
        <FilterDropdown
          label="大会"
          value={f.selectedTournamentId}
          options={tournaments.map((t) => ({
            key: String(t.id),
            label: t.name,
          }))}
          onSelect={f.setSelectedTournamentId}
          isOpen={f.activeFilter === "tournament"}
          onToggle={() => f.toggleFilter("tournament")}
        />
      )}
    </View>
  );

  return (
    <View style={style}>
      <View style={styles.sectionCard}>
        <BattingSection
          stats={battingStats}
          filterBar={buildFilterBar(batting)}
        />
      </View>
      <View style={styles.sectionCard}>
        <PitchingSection
          stats={pitchingStats}
          filterBar={buildFilterBar(pitching)}
        />
      </View>
    </View>
  );
};

// --- Styles ---

const styles = StyleSheet.create({
  sectionCard: {
    backgroundColor: "#27272a",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#d08000",
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 12,
  },
  headline: {
    marginBottom: 16,
  },
  headlineRow: {
    marginBottom: 4,
  },
  headlineLabel: {
    color: "#F4F4F4",
    fontSize: 14,
    fontWeight: "700",
  },
  headlineValue: {
    color: "#F4F4F4",
    fontSize: 20,
    fontWeight: "700",
  },
  headlineSub: {
    color: "#A1A1AA",
    fontSize: 14,
  },
  headlineSummary: {
    color: "#A1A1AA",
    fontSize: 13,
    marginTop: 2,
  },
});

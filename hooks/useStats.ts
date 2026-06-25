import type { StatsFilters } from "../types/profile";
import type { BattingTrendGranularity, StatsPeriod } from "../types/stats";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  getAdditionalStats,
  getBattingTrend,
  getContactQualities,
  getCountSituations,
  getHitDirections,
  getHitLocations,
  getPitchTypes,
  getPitcherAttributeSummary,
  getPitcherFaceoffs,
  getPlateAppearanceBreakdown,
  getTimingBreakdown,
  getBattingStatsTable,
  getPitchingStatsTable,
  getEraTrend,
  getGameSummary,
  getHeadlineStats,
  getRunnersSituation,
} from "../services/statsService";

// 成績集計は数分単位では変化しないため、タブ再表示時の再フェッチを抑える。
// 試合・打席の作成/更新時は invalidateGameResultRelated が明示的に失効させる。
const STATS_STALE_TIME = 60_000;

export const useHitDirections = (filters: StatsFilters) =>
  useQuery({
    queryKey: ["hitDirections", filters],
    queryFn: () => getHitDirections(filters),
    staleTime: STATS_STALE_TIME,
    placeholderData: keepPreviousData,
  });

export const usePlateAppearanceBreakdown = (filters: StatsFilters) =>
  useQuery({
    queryKey: ["paBreakdown", filters],
    queryFn: () => getPlateAppearanceBreakdown(filters),
    staleTime: STATS_STALE_TIME,
    placeholderData: keepPreviousData,
  });

export const useBattingStatsTable = (
  period: StatsPeriod,
  year?: string,
  seasonId?: string,
  tournamentId?: string,
) =>
  useQuery({
    queryKey: ["battingTable", period, year, seasonId, tournamentId],
    queryFn: () => getBattingStatsTable(period, year, seasonId, tournamentId),
    staleTime: STATS_STALE_TIME,
    placeholderData: keepPreviousData,
  });

export const usePitchingStatsTable = (
  period: StatsPeriod,
  year?: string,
  seasonId?: string,
  tournamentId?: string,
) =>
  useQuery({
    queryKey: ["pitchingTable", period, year, seasonId, tournamentId],
    queryFn: () => getPitchingStatsTable(period, year, seasonId, tournamentId),
    staleTime: STATS_STALE_TIME,
    placeholderData: keepPreviousData,
  });

export const useEraTrend = (
  year?: string,
  seasonId?: string,
  tournamentId?: string,
  enabled = true,
) =>
  useQuery({
    queryKey: ["eraTrend", year, seasonId, tournamentId],
    queryFn: () => getEraTrend(year, seasonId, tournamentId),
    enabled,
    staleTime: 0,
    placeholderData: keepPreviousData,
  });

export const useGameSummary = (
  year?: string,
  matchType?: string,
  seasonId?: string,
  tournamentId?: string,
) =>
  useQuery({
    queryKey: ["gameSummary", year, matchType, seasonId, tournamentId],
    queryFn: () => getGameSummary(year, matchType, seasonId, tournamentId),
    staleTime: STATS_STALE_TIME,
    placeholderData: keepPreviousData,
  });

export const useHeadlineStats = (filters: StatsFilters) =>
  useQuery({
    queryKey: ["headlineStats", filters],
    queryFn: () => getHeadlineStats(filters),
    staleTime: STATS_STALE_TIME,
    placeholderData: keepPreviousData,
  });

export const useRunnersSituation = (filters: StatsFilters) =>
  useQuery({
    queryKey: ["runnersSituation", filters],
    queryFn: () => getRunnersSituation(filters),
    staleTime: STATS_STALE_TIME,
    placeholderData: keepPreviousData,
  });

export const useHitLocations = (filters: StatsFilters) =>
  useQuery({
    queryKey: ["hitLocations", filters],
    queryFn: () => getHitLocations(filters),
    staleTime: STATS_STALE_TIME,
    placeholderData: keepPreviousData,
  });

export const useCountSituations = (filters: StatsFilters, enabled = true) =>
  useQuery({
    queryKey: ["countSituations", filters],
    queryFn: () => getCountSituations(filters),
    enabled,
    staleTime: STATS_STALE_TIME,
    placeholderData: keepPreviousData,
  });

export const useContactQualities = (filters: StatsFilters) =>
  useQuery({
    queryKey: ["contactQualities", filters],
    queryFn: () => getContactQualities(filters),
    staleTime: STATS_STALE_TIME,
    placeholderData: keepPreviousData,
  });

export const usePitchTypes = (filters: StatsFilters, enabled = true) =>
  useQuery({
    queryKey: ["pitchTypes", filters],
    queryFn: () => getPitchTypes(filters),
    enabled,
    staleTime: STATS_STALE_TIME,
    placeholderData: keepPreviousData,
  });

export const usePitcherFaceoffs = (filters: StatsFilters, enabled = true) =>
  useQuery({
    queryKey: ["pitcherFaceoffs", filters],
    queryFn: () => getPitcherFaceoffs(filters),
    enabled,
    staleTime: STATS_STALE_TIME,
    placeholderData: keepPreviousData,
  });

export const usePitcherAttributeSummary = (filters: StatsFilters) =>
  useQuery({
    queryKey: ["pitcherAttributeSummary", filters],
    queryFn: () => getPitcherAttributeSummary(filters),
    staleTime: STATS_STALE_TIME,
    placeholderData: keepPreviousData,
  });

export const useBattingTrend = (
  filters: StatsFilters,
  granularity: BattingTrendGranularity,
) =>
  useQuery({
    queryKey: ["battingTrend", filters, granularity],
    queryFn: () => getBattingTrend(filters, granularity),
    staleTime: STATS_STALE_TIME,
    placeholderData: keepPreviousData,
  });

export const useAdditionalStats = (filters: StatsFilters) =>
  useQuery({
    queryKey: ["additionalStats", filters],
    queryFn: () => getAdditionalStats(filters),
    staleTime: STATS_STALE_TIME,
    placeholderData: keepPreviousData,
  });

export const useTimingBreakdown = (filters: StatsFilters) =>
  useQuery({
    queryKey: ["timingBreakdown", filters],
    queryFn: () => getTimingBreakdown(filters),
    staleTime: STATS_STALE_TIME,
    placeholderData: keepPreviousData,
  });

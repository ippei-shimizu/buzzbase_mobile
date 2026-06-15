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
  getOutTypeBreakdown,
  getPitchTypes,
  getPitcherFaceoffs,
  getPlateAppearanceBreakdown,
  getBattingStatsTable,
  getPitchingStatsTable,
  getEraTrend,
  getGameSummary,
  getHeadlineStats,
  getRunnersSituation,
} from "../services/statsService";

export const useHitDirections = (filters: StatsFilters) =>
  useQuery({
    queryKey: ["hitDirections", filters],
    queryFn: () => getHitDirections(filters),
    placeholderData: keepPreviousData,
  });

export const usePlateAppearanceBreakdown = (filters: StatsFilters) =>
  useQuery({
    queryKey: ["paBreakdown", filters],
    queryFn: () => getPlateAppearanceBreakdown(filters),
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
    placeholderData: keepPreviousData,
  });

export const useHeadlineStats = (filters: StatsFilters) =>
  useQuery({
    queryKey: ["headlineStats", filters],
    queryFn: () => getHeadlineStats(filters),
    placeholderData: keepPreviousData,
  });

export const useRunnersSituation = (filters: StatsFilters) =>
  useQuery({
    queryKey: ["runnersSituation", filters],
    queryFn: () => getRunnersSituation(filters),
    placeholderData: keepPreviousData,
  });

export const useHitLocations = (filters: StatsFilters) =>
  useQuery({
    queryKey: ["hitLocations", filters],
    queryFn: () => getHitLocations(filters),
    placeholderData: keepPreviousData,
  });

export const useOutTypeBreakdown = (filters: StatsFilters) =>
  useQuery({
    queryKey: ["outTypeBreakdown", filters],
    queryFn: () => getOutTypeBreakdown(filters),
    placeholderData: keepPreviousData,
  });

export const useCountSituations = (filters: StatsFilters) =>
  useQuery({
    queryKey: ["countSituations", filters],
    queryFn: () => getCountSituations(filters),
    placeholderData: keepPreviousData,
  });

export const useContactQualities = (filters: StatsFilters) =>
  useQuery({
    queryKey: ["contactQualities", filters],
    queryFn: () => getContactQualities(filters),
    placeholderData: keepPreviousData,
  });

export const usePitchTypes = (filters: StatsFilters) =>
  useQuery({
    queryKey: ["pitchTypes", filters],
    queryFn: () => getPitchTypes(filters),
    placeholderData: keepPreviousData,
  });

export const usePitcherFaceoffs = (filters: StatsFilters) =>
  useQuery({
    queryKey: ["pitcherFaceoffs", filters],
    queryFn: () => getPitcherFaceoffs(filters),
    placeholderData: keepPreviousData,
  });

export const useBattingTrend = (
  filters: StatsFilters,
  granularity: BattingTrendGranularity,
) =>
  useQuery({
    queryKey: ["battingTrend", filters, granularity],
    queryFn: () => getBattingTrend(filters, granularity),
    placeholderData: keepPreviousData,
  });

export const useAdditionalStats = (filters: StatsFilters) =>
  useQuery({
    queryKey: ["additionalStats", filters],
    queryFn: () => getAdditionalStats(filters),
    placeholderData: keepPreviousData,
  });

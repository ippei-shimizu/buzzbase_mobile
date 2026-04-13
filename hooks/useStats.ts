import type { StatsFilters } from "../types/profile";
import type { StatsPeriod } from "../types/stats";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  getHitDirections,
  getPlateAppearanceBreakdown,
  getBattingStatsTable,
  getPitchingStatsTable,
  getEraTrend,
  getGameSummary,
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

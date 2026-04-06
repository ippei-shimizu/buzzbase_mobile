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
) =>
  useQuery({
    queryKey: ["battingTable", period, year, seasonId],
    queryFn: () => getBattingStatsTable(period, year, seasonId),
    placeholderData: keepPreviousData,
  });

export const usePitchingStatsTable = (
  period: StatsPeriod,
  year?: string,
  seasonId?: string,
) =>
  useQuery({
    queryKey: ["pitchingTable", period, year, seasonId],
    queryFn: () => getPitchingStatsTable(period, year, seasonId),
    placeholderData: keepPreviousData,
  });

export const useEraTrend = (year?: string, seasonId?: string, enabled = true) =>
  useQuery({
    queryKey: ["eraTrend", year, seasonId],
    queryFn: () => getEraTrend(year, seasonId),
    enabled,
    staleTime: 0,
    placeholderData: keepPreviousData,
  });

export const useGameSummary = (
  year?: string,
  matchType?: string,
  seasonId?: string,
) =>
  useQuery({
    queryKey: ["gameSummary", year, matchType, seasonId],
    queryFn: () => getGameSummary(year, matchType, seasonId),
  });

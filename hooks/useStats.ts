import { useQuery } from "@tanstack/react-query";
import {
  getHitDirections,
  getPlateAppearanceBreakdown,
  getBattingStatsTable,
  getPitchingStatsTable,
  getEraTrend,
  getGameSummary,
} from "../services/statsService";
import type { StatsFilters } from "../types/profile";
import type { StatsPeriod } from "../types/stats";

export const useHitDirections = (filters: StatsFilters) =>
  useQuery({
    queryKey: ["hitDirections", filters],
    queryFn: () => getHitDirections(filters),
  });

export const usePlateAppearanceBreakdown = (filters: StatsFilters) =>
  useQuery({
    queryKey: ["paBreakdown", filters],
    queryFn: () => getPlateAppearanceBreakdown(filters),
  });

export const useBattingStatsTable = (
  period: StatsPeriod,
  year?: string,
  seasonId?: string,
) =>
  useQuery({
    queryKey: ["battingTable", period, year, seasonId],
    queryFn: () => getBattingStatsTable(period, year, seasonId),
  });

export const usePitchingStatsTable = (
  period: StatsPeriod,
  year?: string,
  seasonId?: string,
) =>
  useQuery({
    queryKey: ["pitchingTable", period, year, seasonId],
    queryFn: () => getPitchingStatsTable(period, year, seasonId),
  });

export const useEraTrend = (year?: string, seasonId?: string, enabled = true) =>
  useQuery({
    queryKey: ["eraTrend", year, seasonId],
    queryFn: () => getEraTrend(year, seasonId),
    enabled,
    staleTime: 0,
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

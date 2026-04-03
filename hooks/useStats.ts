import { useQuery } from "@tanstack/react-query";
import {
  getHitDirections,
  getPlateAppearanceBreakdown,
  getBattingStatsTable,
  getPitchingStatsTable,
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

export const useBattingStatsTable = (period: StatsPeriod, year?: string) =>
  useQuery({
    queryKey: ["battingTable", period, year],
    queryFn: () => getBattingStatsTable(period, year),
  });

export const usePitchingStatsTable = (period: StatsPeriod, year?: string) =>
  useQuery({
    queryKey: ["pitchingTable", period, year],
    queryFn: () => getPitchingStatsTable(period, year),
  });

export const useGameSummary = (year?: string) =>
  useQuery({
    queryKey: ["gameSummary", year],
    queryFn: () => getGameSummary(year),
  });

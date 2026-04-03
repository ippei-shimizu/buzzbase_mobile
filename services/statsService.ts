import axiosInstance from "@utils/axiosInstance";
import { API_BASE_URL } from "@constants/api";
import type {
  HitDirection,
  PlateAppearanceCategory,
  BattingStatsRow,
  PitchingStatsRow,
  GameSummary,
  StatsPeriod,
} from "../types/stats";
import type { StatsFilters } from "../types/profile";

const STATS_URL = `${API_BASE_URL}/api/v2/stats`;

export const getHitDirections = async (
  filters: StatsFilters,
): Promise<HitDirection[]> => {
  const params = new URLSearchParams();
  if (filters.year) params.append("year", filters.year);
  if (filters.matchType) params.append("match_type", filters.matchType);
  if (filters.seasonId) params.append("season_id", filters.seasonId);
  const res = await axiosInstance.get(`${STATS_URL}/hit_directions?${params}`);
  return res.data.directions;
};

export const getPlateAppearanceBreakdown = async (
  filters: StatsFilters,
): Promise<PlateAppearanceCategory[]> => {
  const params = new URLSearchParams();
  if (filters.year) params.append("year", filters.year);
  if (filters.matchType) params.append("match_type", filters.matchType);
  if (filters.seasonId) params.append("season_id", filters.seasonId);
  const res = await axiosInstance.get(
    `${STATS_URL}/plate_appearance_breakdown?${params}`,
  );
  return res.data.breakdown;
};

export const getBattingStatsTable = async (
  period: StatsPeriod,
  year?: string,
): Promise<BattingStatsRow[]> => {
  const params = new URLSearchParams();
  params.append("period", period);
  if (year) params.append("year", year);
  const res = await axiosInstance.get(`${STATS_URL}/batting?${params}`);
  return res.data.rows;
};

export const getPitchingStatsTable = async (
  period: StatsPeriod,
  year?: string,
): Promise<PitchingStatsRow[]> => {
  const params = new URLSearchParams();
  params.append("period", period);
  if (year) params.append("year", year);
  const res = await axiosInstance.get(`${STATS_URL}/pitching?${params}`);
  return res.data.rows;
};

export const getGameSummary = async (year?: string): Promise<GameSummary> => {
  const params = year ? `?year=${year}` : "";
  const res = await axiosInstance.get(`${STATS_URL}/game_summary${params}`);
  return res.data;
};

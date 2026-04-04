import axiosInstance from "@utils/axiosInstance";
import { API_BASE_URL } from "@constants/api";
import type {
  HitDirectionData,
  PlateAppearanceCategory,
  BattingStatsRow,
  PitchingStatsRow,
  EraTrendPoint,
  GameSummary,
  StatsPeriod,
} from "../types/stats";
import type { StatsFilters } from "../types/profile";

const STATS_URL = `${API_BASE_URL}/api/v2/stats`;

export const getHitDirections = async (
  filters: StatsFilters,
): Promise<HitDirectionData> => {
  const params = new URLSearchParams();
  if (filters.year) params.append("year", filters.year);
  if (filters.matchType) params.append("match_type", filters.matchType);
  if (filters.seasonId) params.append("season_id", filters.seasonId);
  const res = await axiosInstance.get(`${STATS_URL}/hit_directions?${params}`);
  return res.data;
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
  seasonId?: string,
): Promise<BattingStatsRow[]> => {
  const params = new URLSearchParams();
  params.append("period", period);
  if (year) params.append("year", year);
  if (seasonId) params.append("season_id", seasonId);
  const res = await axiosInstance.get(`${STATS_URL}/batting?${params}`);
  return res.data.rows;
};

export const getPitchingStatsTable = async (
  period: StatsPeriod,
  year?: string,
  seasonId?: string,
): Promise<PitchingStatsRow[]> => {
  const params = new URLSearchParams();
  params.append("period", period);
  if (year) params.append("year", year);
  if (seasonId) params.append("season_id", seasonId);
  const res = await axiosInstance.get(`${STATS_URL}/pitching?${params}`);
  return res.data.rows;
};

export const getEraTrend = async (
  year?: string,
  seasonId?: string,
): Promise<EraTrendPoint[]> => {
  const params = new URLSearchParams();
  if (year) params.append("year", year);
  if (seasonId) params.append("season_id", seasonId);
  const query = params.toString();
  const url = `${STATS_URL}/era_trend${query ? `?${query}` : ""}`;
  const res = await axiosInstance.get(url);
  return res.data.trend;
};

export const getGameSummary = async (
  year?: string,
  matchType?: string,
  seasonId?: string,
): Promise<GameSummary> => {
  const params = new URLSearchParams();
  if (year) params.append("year", year);
  if (matchType) params.append("match_type", matchType);
  if (seasonId) params.append("season_id", seasonId);
  const query = params.toString();
  const res = await axiosInstance.get(
    `${STATS_URL}/game_summary${query ? `?${query}` : ""}`,
  );
  return res.data;
};

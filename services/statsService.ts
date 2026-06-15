import type { StatsFilters } from "../types/profile";
import type {
  AdditionalStats,
  BattingTrendData,
  BattingTrendGranularity,
  ContactQualityData,
  CountSituations,
  HitDirectionData,
  HitLocationData,
  OutTypeBreakdownData,
  PitchTypeData,
  PitcherFaceoffData,
  PlateAppearanceCategory,
  BattingStatsRow,
  PitchingStatsRow,
  EraTrendPoint,
  GameSummary,
  HeadlineStats,
  RunnersSituationSummary,
  StatsPeriod,
} from "../types/stats";
import { API_BASE_URL } from "@constants/api";
import axiosInstance from "@utils/axiosInstance";

const STATS_URL = `${API_BASE_URL}/api/v2/stats`;

const buildStatsQuery = (filters: StatsFilters): string => {
  const params = new URLSearchParams();
  if (filters.year) params.append("year", filters.year);
  if (filters.matchType) params.append("match_type", filters.matchType);
  if (filters.seasonId) params.append("season_id", filters.seasonId);
  if (filters.tournamentId)
    params.append("tournament_id", filters.tournamentId);
  return params.toString();
};

export const getHitDirections = async (
  filters: StatsFilters,
): Promise<HitDirectionData> => {
  const query = buildStatsQuery(filters);
  const res = await axiosInstance.get(
    `${STATS_URL}/hit_directions${query ? `?${query}` : ""}`,
  );
  return res.data;
};

export const getPlateAppearanceBreakdown = async (
  filters: StatsFilters,
): Promise<PlateAppearanceCategory[]> => {
  const query = buildStatsQuery(filters);
  const res = await axiosInstance.get(
    `${STATS_URL}/plate_appearance_breakdown${query ? `?${query}` : ""}`,
  );
  return res.data.breakdown;
};

export const getBattingStatsTable = async (
  period: StatsPeriod,
  year?: string,
  seasonId?: string,
  tournamentId?: string,
): Promise<BattingStatsRow[]> => {
  const params = new URLSearchParams();
  params.append("period", period);
  if (year) params.append("year", year);
  if (seasonId) params.append("season_id", seasonId);
  if (tournamentId) params.append("tournament_id", tournamentId);
  const res = await axiosInstance.get(`${STATS_URL}/batting?${params}`);
  return res.data.rows;
};

export const getPitchingStatsTable = async (
  period: StatsPeriod,
  year?: string,
  seasonId?: string,
  tournamentId?: string,
): Promise<PitchingStatsRow[]> => {
  const params = new URLSearchParams();
  params.append("period", period);
  if (year) params.append("year", year);
  if (seasonId) params.append("season_id", seasonId);
  if (tournamentId) params.append("tournament_id", tournamentId);
  const res = await axiosInstance.get(`${STATS_URL}/pitching?${params}`);
  return res.data.rows;
};

export const getEraTrend = async (
  year?: string,
  seasonId?: string,
  tournamentId?: string,
): Promise<EraTrendPoint[]> => {
  const params = new URLSearchParams();
  if (year) params.append("year", year);
  if (seasonId) params.append("season_id", seasonId);
  if (tournamentId) params.append("tournament_id", tournamentId);
  const query = params.toString();
  const url = `${STATS_URL}/era_trend${query ? `?${query}` : ""}`;
  const res = await axiosInstance.get(url);
  return res.data.trend;
};

export const getGameSummary = async (
  year?: string,
  matchType?: string,
  seasonId?: string,
  tournamentId?: string,
): Promise<GameSummary> => {
  const params = new URLSearchParams();
  if (year) params.append("year", year);
  if (matchType) params.append("match_type", matchType);
  if (seasonId) params.append("season_id", seasonId);
  if (tournamentId) params.append("tournament_id", tournamentId);
  const query = params.toString();
  const res = await axiosInstance.get(
    `${STATS_URL}/game_summary${query ? `?${query}` : ""}`,
  );
  return res.data;
};

export const getHeadlineStats = async (
  filters: StatsFilters,
): Promise<HeadlineStats> => {
  const query = buildStatsQuery(filters);
  const res = await axiosInstance.get(
    `${STATS_URL}/headline_stats${query ? `?${query}` : ""}`,
  );
  return res.data;
};

export const getRunnersSituation = async (
  filters: StatsFilters,
): Promise<RunnersSituationSummary> => {
  const query = buildStatsQuery(filters);
  const res = await axiosInstance.get(
    `${STATS_URL}/runners_situation${query ? `?${query}` : ""}`,
  );
  return res.data;
};

export const getHitLocations = async (
  filters: StatsFilters,
): Promise<HitLocationData> => {
  const query = buildStatsQuery(filters);
  const res = await axiosInstance.get(
    `${STATS_URL}/hit_locations${query ? `?${query}` : ""}`,
  );
  return res.data;
};

export const getOutTypeBreakdown = async (
  filters: StatsFilters,
): Promise<OutTypeBreakdownData> => {
  const query = buildStatsQuery(filters);
  const res = await axiosInstance.get(
    `${STATS_URL}/out_type_breakdown${query ? `?${query}` : ""}`,
  );
  return res.data;
};

export const getCountSituations = async (
  filters: StatsFilters,
): Promise<CountSituations> => {
  const query = buildStatsQuery(filters);
  const res = await axiosInstance.get(
    `${STATS_URL}/count_situations${query ? `?${query}` : ""}`,
  );
  return res.data;
};

export const getContactQualities = async (
  filters: StatsFilters,
): Promise<ContactQualityData> => {
  const query = buildStatsQuery(filters);
  const res = await axiosInstance.get(
    `${STATS_URL}/contact_qualities${query ? `?${query}` : ""}`,
  );
  return res.data;
};

export const getPitchTypes = async (
  filters: StatsFilters,
): Promise<PitchTypeData> => {
  const query = buildStatsQuery(filters);
  const res = await axiosInstance.get(
    `${STATS_URL}/pitch_types${query ? `?${query}` : ""}`,
  );
  return res.data;
};

export const getPitcherFaceoffs = async (
  filters: StatsFilters,
): Promise<PitcherFaceoffData> => {
  const query = buildStatsQuery(filters);
  const res = await axiosInstance.get(
    `${STATS_URL}/pitcher_faceoffs${query ? `?${query}` : ""}`,
  );
  return res.data;
};

export const getBattingTrend = async (
  filters: StatsFilters,
  granularity: BattingTrendGranularity,
): Promise<BattingTrendData> => {
  const params = new URLSearchParams();
  if (filters.year) params.append("year", filters.year);
  if (filters.matchType) params.append("match_type", filters.matchType);
  if (filters.seasonId) params.append("season_id", filters.seasonId);
  if (filters.tournamentId)
    params.append("tournament_id", filters.tournamentId);
  params.append("granularity", granularity);
  const res = await axiosInstance.get(
    `${STATS_URL}/batting_trend?${params.toString()}`,
  );
  return res.data;
};

export const getAdditionalStats = async (
  filters: StatsFilters,
): Promise<AdditionalStats> => {
  const query = buildStatsQuery(filters);
  const res = await axiosInstance.get(
    `${STATS_URL}/additional_stats${query ? `?${query}` : ""}`,
  );
  return res.data;
};

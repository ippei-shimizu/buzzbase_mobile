import axiosInstance from "@utils/axiosInstance";
import { API_BASE_URL } from "@constants/api";
import type {
  UserProfile,
  UserProfileDetail,
  StatsFilters,
} from "../types/profile";
import type { BattingStats, PitchingStats } from "../types/dashboard";

export const getCurrentUserProfile = async (): Promise<UserProfile> => {
  const response = await axiosInstance.get<UserProfile>("/user");
  return response.data;
};

export const updateUserProfile = async (data: FormData): Promise<void> => {
  await axiosInstance.put("/user", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const getProfileBattingStats = async (
  filters: StatsFilters,
): Promise<BattingStats> => {
  const params = new URLSearchParams();
  if (filters.year) params.append("year", filters.year);
  if (filters.matchType) params.append("match_type", filters.matchType);
  if (filters.seasonId) params.append("season_id", filters.seasonId);

  const response = await axiosInstance.get<BattingStats>(
    `${API_BASE_URL}/api/v2/dashboard/batting_stats?${params.toString()}`,
  );
  return response.data;
};

export const getUserBattingStats = async (
  userId: number,
  filters: StatsFilters,
): Promise<BattingStats> => {
  const params = new URLSearchParams();
  params.append("user_id", String(userId));
  if (filters.year) params.append("year", filters.year);
  if (filters.matchType) params.append("match_type", filters.matchType);
  if (filters.seasonId) params.append("season_id", filters.seasonId);

  const response = await axiosInstance.get<BattingStats>(
    `${API_BASE_URL}/api/v2/dashboard/batting_stats?${params.toString()}`,
  );
  return response.data;
};

export const getUserPitchingStats = async (
  userId: number,
  filters: StatsFilters,
): Promise<PitchingStats> => {
  const params = new URLSearchParams();
  params.append("user_id", String(userId));
  if (filters.year) params.append("year", filters.year);
  if (filters.matchType) params.append("match_type", filters.matchType);
  if (filters.seasonId) params.append("season_id", filters.seasonId);

  const response = await axiosInstance.get<PitchingStats>(
    `${API_BASE_URL}/api/v2/dashboard/pitching_stats?${params.toString()}`,
  );
  return response.data;
};

export const getUserProfileDetail = async (
  userId: string,
): Promise<UserProfileDetail> => {
  const response = await axiosInstance.get<UserProfileDetail>(
    `/users/show_user_id_data?user_id=${userId}`,
  );
  return response.data;
};

export const deleteAccount = async (): Promise<void> => {
  await axiosInstance.delete("/user");
};

export const getProfilePitchingStats = async (
  filters: StatsFilters,
): Promise<PitchingStats> => {
  const params = new URLSearchParams();
  if (filters.year) params.append("year", filters.year);
  if (filters.matchType) params.append("match_type", filters.matchType);
  if (filters.seasonId) params.append("season_id", filters.seasonId);

  const response = await axiosInstance.get<PitchingStats>(
    `${API_BASE_URL}/api/v2/dashboard/pitching_stats?${params.toString()}`,
  );
  return response.data;
};

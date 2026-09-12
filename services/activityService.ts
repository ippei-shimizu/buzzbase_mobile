import type { HeatmapResponse, StreakSummary } from "../types/activity";
import { API_BASE_URL } from "@constants/api";
import axiosInstance from "@utils/axiosInstance";

const URL = `${API_BASE_URL}/api/v2/activity_logs`;

export const getHeatmap = async (params?: {
  from?: string;
  to?: string;
}): Promise<HeatmapResponse> => {
  const res = await axiosInstance.get<HeatmapResponse>(URL, { params });
  return res.data;
};

export const getStreak = async (): Promise<StreakSummary> => {
  const res = await axiosInstance.get<StreakSummary>(`${URL}/streak`);
  return res.data;
};

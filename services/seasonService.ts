import axiosInstance from "@utils/axiosInstance";
import type { Season, SeasonParams } from "../types/season";

export const getSeasons = async (userId?: number): Promise<Season[]> => {
  const params = userId ? { user_id: userId } : {};
  const response = await axiosInstance.get<Season[]>("/seasons", { params });
  return response.data;
};

export const createSeason = async (params: SeasonParams): Promise<Season> => {
  const response = await axiosInstance.post<Season>("/seasons", {
    season: params,
  });
  return response.data;
};

export const updateSeason = async (
  id: number,
  params: SeasonParams,
): Promise<Season> => {
  const response = await axiosInstance.patch<Season>(`/seasons/${id}`, {
    season: params,
  });
  return response.data;
};

export const deleteSeason = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/seasons/${id}`);
};

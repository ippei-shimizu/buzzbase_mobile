import axiosInstance from "@utils/axiosInstance";
import { API_BASE_URL } from "@constants/api";
import type { GameResultsResponse } from "../types/gameResult";

export const deleteGameResult = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/game_results/${id}`);
};

export const getUserGameResults = async (
  userId: number,
  page: number,
): Promise<GameResultsResponse> => {
  const response = await axiosInstance.get<GameResultsResponse>(
    `${API_BASE_URL}/api/v2/game_results/user/${userId}?page=${page}`,
  );
  return response.data;
};

export const getGameResults = async (
  page: number,
): Promise<GameResultsResponse> => {
  const response = await axiosInstance.get<GameResultsResponse>(
    `${API_BASE_URL}/api/v2/game_results?page=${page}`,
  );
  return response.data;
};

export interface GameResultFilterParams {
  page?: number;
  per_page?: number;
  year?: string;
  match_type?: string;
  season_id?: string;
  search?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export const getFilteredGameResults = async (
  params: GameResultFilterParams,
): Promise<GameResultsResponse> => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.set("page", String(params.page));
  if (params.per_page) queryParams.set("per_page", String(params.per_page));
  if (params.year) queryParams.set("year", params.year);
  if (params.match_type) queryParams.set("match_type", params.match_type);
  if (params.season_id) queryParams.set("season_id", params.season_id);
  if (params.search) queryParams.set("search", params.search);
  if (params.sort_by) queryParams.set("sort_by", params.sort_by);
  if (params.sort_order) queryParams.set("sort_order", params.sort_order);

  const response = await axiosInstance.get<GameResultsResponse>(
    `${API_BASE_URL}/api/v2/game_results/filtered_index?${queryParams.toString()}`,
  );
  return response.data;
};

export const getFilteredUserGameResults = async (
  userId: number,
  params: GameResultFilterParams,
): Promise<GameResultsResponse> => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.set("page", String(params.page));
  if (params.per_page) queryParams.set("per_page", String(params.per_page));
  if (params.year) queryParams.set("year", params.year);
  if (params.match_type) queryParams.set("match_type", params.match_type);
  if (params.season_id) queryParams.set("season_id", params.season_id);
  if (params.search) queryParams.set("search", params.search);
  if (params.sort_by) queryParams.set("sort_by", params.sort_by);
  if (params.sort_order) queryParams.set("sort_order", params.sort_order);

  const response = await axiosInstance.get<GameResultsResponse>(
    `${API_BASE_URL}/api/v2/game_results/filtered_user/${userId}?${queryParams.toString()}`,
  );
  return response.data;
};

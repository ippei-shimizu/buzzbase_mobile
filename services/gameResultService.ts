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

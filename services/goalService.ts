import type { Goal, GoalInput } from "../types/goal";
import { API_BASE_URL } from "@constants/api";
import axiosInstance from "@utils/axiosInstance";

const URL = `${API_BASE_URL}/api/v2/goals`;

export const getGoals = async (): Promise<Goal[]> => {
  const res = await axiosInstance.get<Goal[]>(URL);
  return res.data;
};

export const getGoalHistory = async (): Promise<Goal[]> => {
  const res = await axiosInstance.get<Goal[]>(`${URL}/history`);
  return res.data;
};

export const createGoal = async (input: GoalInput): Promise<Goal> => {
  const res = await axiosInstance.post<Goal>(URL, { goal: input });
  return res.data;
};

export const deleteGoal = async (id: number): Promise<void> => {
  await axiosInstance.delete(`${URL}/${id}`);
};

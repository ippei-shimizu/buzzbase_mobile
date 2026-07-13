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

export const updateGoal = async (
  id: number,
  input: GoalInput,
): Promise<Goal> => {
  const res = await axiosInstance.patch<Goal>(`${URL}/${id}`, { goal: input });
  return res.data;
};

export const deleteGoal = async (id: number): Promise<void> => {
  await axiosInstance.delete(`${URL}/${id}`);
};

/** 定性目標を達成にする。 */
export const achieveGoal = async (id: number): Promise<Goal> => {
  const res = await axiosInstance.post<Goal>(`${URL}/${id}/achievement`);
  return res.data;
};

/** 定性目標の達成を取り消す。 */
export const unachieveGoal = async (id: number): Promise<Goal> => {
  const res = await axiosInstance.delete<Goal>(`${URL}/${id}/achievement`);
  return res.data;
};

import type { PracticeLog, PracticeLogInput } from "../types/practice";
import { API_BASE_URL } from "@constants/api";
import axiosInstance from "@utils/axiosInstance";

const URL = `${API_BASE_URL}/api/v2/practice_logs`;

export const getPracticeLogs = async (params?: {
  from?: string;
  to?: string;
}): Promise<PracticeLog[]> => {
  const res = await axiosInstance.get<PracticeLog[]>(URL, { params });
  return res.data;
};

export const createPracticeLog = async (
  input: PracticeLogInput,
): Promise<PracticeLog> => {
  const res = await axiosInstance.post<PracticeLog>(URL, {
    practice_log: input,
  });
  return res.data;
};

export const deletePracticeLog = async (id: number): Promise<void> => {
  await axiosInstance.delete(`${URL}/${id}`);
};

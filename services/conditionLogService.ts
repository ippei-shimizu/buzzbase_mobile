import type { ConditionLog, ConditionLogInput } from "../types/practice";
import { API_BASE_URL } from "@constants/api";
import axiosInstance from "@utils/axiosInstance";

const URL = `${API_BASE_URL}/api/v2/condition_logs`;

export const getConditionLogByDate = async (
  date: string,
): Promise<ConditionLog | null> => {
  const res = await axiosInstance.get<ConditionLog | null>(`${URL}/by_date`, {
    params: { date },
  });
  return res.data;
};

export const upsertConditionLog = async (
  input: ConditionLogInput,
): Promise<ConditionLog> => {
  const res = await axiosInstance.post<ConditionLog>(`${URL}/upsert`, {
    condition_log: input,
  });
  return res.data;
};

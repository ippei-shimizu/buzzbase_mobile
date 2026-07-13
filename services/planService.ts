import type { CalendarResponse, Plan } from "../types/plan";
import { API_BASE_URL } from "@constants/api";
import axiosInstance from "@utils/axiosInstance";

const URL = `${API_BASE_URL}/api/v2/plans`;

/** 指定日の予定（繰り返し ∪ 単発）を展開して取得する。「今日のやること」用。 */
export const getDayPlan = async (date: string): Promise<Plan[]> => {
  const res = await axiosInstance.get<Plan[]>(`${URL}/by_date`, {
    params: { date },
  });
  return res.data;
};

/** 期間内の日別予定サマリーを取得する。カレンダー俯瞰用。 */
export const getCalendar = async (
  from: string,
  to: string,
): Promise<CalendarResponse> => {
  const res = await axiosInstance.get<CalendarResponse>(`${URL}/calendar`, {
    params: { from, to },
  });
  return res.data;
};

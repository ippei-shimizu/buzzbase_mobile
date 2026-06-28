import type { MenuSummary } from "../types/practice";
import { API_BASE_URL } from "@constants/api";
import axiosInstance from "@utils/axiosInstance";

const URL = `${API_BASE_URL}/api/v2/practice_menu_summaries`;

export const getMenuSummaries = async (): Promise<MenuSummary[]> => {
  const res = await axiosInstance.get<MenuSummary[]>(URL);
  return res.data;
};

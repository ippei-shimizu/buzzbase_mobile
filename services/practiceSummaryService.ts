import type {
  MenuSummary,
  MenuTrend,
  PracticeOverview,
} from "../types/practice";
import { API_BASE_URL } from "@constants/api";
import axiosInstance from "@utils/axiosInstance";

const BASE = `${API_BASE_URL}/api/v2`;

export const getMenuSummaries = async (): Promise<MenuSummary[]> => {
  const res = await axiosInstance.get<MenuSummary[]>(
    `${BASE}/practice_menu_summaries`,
  );
  return res.data;
};

export const getPracticeOverview = async (): Promise<PracticeOverview> => {
  const res = await axiosInstance.get<PracticeOverview>(
    `${BASE}/practice_overview`,
  );
  return res.data;
};

export const getMenuTrend = async (menuId: number): Promise<MenuTrend> => {
  const res = await axiosInstance.get<MenuTrend>(
    `${BASE}/practice_menu_trends/${menuId}`,
  );
  return res.data;
};

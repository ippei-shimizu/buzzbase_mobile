import axiosInstance from "@utils/axiosInstance";
import { API_BASE_URL } from "@constants/api";
import type { DashboardData } from "../types/dashboard";

export const getDashboardData = async (): Promise<DashboardData> => {
  const response = await axiosInstance.get<DashboardData>(
    `${API_BASE_URL}/api/v2/dashboard`,
  );
  return response.data;
};

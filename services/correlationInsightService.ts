import type { CorrelationInsightsResponse } from "../types/insight";
import { API_BASE_URL } from "@constants/api";
import axiosInstance from "@utils/axiosInstance";

const URL = `${API_BASE_URL}/api/v2/correlation_insights`;

export const getCorrelationInsights =
  async (): Promise<CorrelationInsightsResponse> => {
    const res = await axiosInstance.get<CorrelationInsightsResponse>(URL);
    return res.data;
  };

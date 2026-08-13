import type {
  CorrelationInsightsResponse,
  InsightCombinationInput,
} from "../types/insight";
import { API_BASE_URL } from "@constants/api";
import axiosInstance from "@utils/axiosInstance";

const URL = `${API_BASE_URL}/api/v2/correlation_insights`;
const COMBINATIONS_URL = `${API_BASE_URL}/api/v2/insight_combinations`;

export const getCorrelationInsights =
  async (): Promise<CorrelationInsightsResponse> => {
    const res = await axiosInstance.get<CorrelationInsightsResponse>(URL);
    return res.data;
  };

export const createInsightCombination = async (
  input: InsightCombinationInput,
): Promise<void> => {
  await axiosInstance.post(COMBINATIONS_URL, { insight_combination: input });
};

export const deleteInsightCombination = async (id: number): Promise<void> => {
  await axiosInstance.delete(`${COMBINATIONS_URL}/${id}`);
};

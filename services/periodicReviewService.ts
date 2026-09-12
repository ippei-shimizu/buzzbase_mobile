import type { PeriodicReview } from "../types/periodicReview";
import { API_BASE_URL } from "@constants/api";
import axiosInstance from "@utils/axiosInstance";

const URL = `${API_BASE_URL}/api/v2/periodic_reviews`;

export const getPeriodicReviews = async (): Promise<PeriodicReview[]> => {
  const res = await axiosInstance.get<PeriodicReview[]>(URL);
  return res.data;
};

export const markPeriodicReviewRead = async (
  id: number,
): Promise<PeriodicReview> => {
  const res = await axiosInstance.patch<PeriodicReview>(`${URL}/${id}`, {});
  return res.data;
};

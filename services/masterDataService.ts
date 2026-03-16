import axiosInstance from "@utils/axiosInstance";
import type { Prefecture, BaseballCategory } from "../types/profile";

/** GET /prefectures — 都道府県一覧取得 */
export const getPrefectures = async (): Promise<Prefecture[]> => {
  const response = await axiosInstance.get("/prefectures");
  return response.data;
};

/** GET /baseball_categories — 野球カテゴリ一覧取得 */
export const getBaseballCategories = async (): Promise<BaseballCategory[]> => {
  const response = await axiosInstance.get("/baseball_categories");
  return response.data;
};

import type {
  CreateStadiumPayload,
  Stadium,
  StadiumSearchResponse,
} from "../types/stadium";
import { API_BASE_URL } from "@constants/api";
import axiosInstance from "@utils/axiosInstance";

const V2_STADIUMS_URL = `${API_BASE_URL}/api/v2/stadiums`;

/**
 * 球場マスタを検索する。
 *
 * @param params q: 球場名の部分一致検索 / prefecture_id: 都道府県絞り込み / per_page: 1ページ件数
 * @returns ページネーション付きの球場一覧
 */
export const searchStadiums = async (params: {
  q?: string;
  prefecture_id?: number;
  per_page?: number;
}): Promise<StadiumSearchResponse> => {
  const response = await axiosInstance.get<StadiumSearchResponse>(
    V2_STADIUMS_URL,
    { params },
  );
  return response.data;
};

/**
 * 球場マスタを新規追加する。サーバー側で created_by_user_id が自動設定される。
 */
export const createStadium = async (
  payload: CreateStadiumPayload,
): Promise<Stadium> => {
  const response = await axiosInstance.post<Stadium>(V2_STADIUMS_URL, {
    stadium: payload,
  });
  return response.data;
};

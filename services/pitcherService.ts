import type {
  Pitcher,
  PitcherInput,
  PitcherListResponse,
} from "../types/pitcher";
import { API_BASE_URL } from "@constants/api";
import axiosInstance from "@utils/axiosInstance";

const V2_PITCHERS_URL = `${API_BASE_URL}/api/v2/pitchers`;

interface PitcherSearchParams {
  q?: string;
  team_id?: number | null;
  per_page?: number;
}

/**
 * 相手投手マスタ一覧を取得する。
 * サーバ側で `created_by_user_id = current_user.id` で絞り込み済みのため、
 * フロントはそのまま表示に使ってよい。
 */
export const getPitchers = async (
  params?: PitcherSearchParams,
): Promise<PitcherListResponse> => {
  const response = await axiosInstance.get<PitcherListResponse>(
    V2_PITCHERS_URL,
    {
      params,
    },
  );
  return response.data;
};

/**
 * 相手投手を新規追加する。
 * `created_by_user_id` はサーバ側で current user に固定されるためペイロードに含めない。
 */
export const createPitcher = async (
  payload: PitcherInput,
): Promise<Pitcher> => {
  const response = await axiosInstance.post<Pitcher>(V2_PITCHERS_URL, {
    pitcher: payload,
  });
  return response.data;
};

import type { HitDirectionListResponse } from "../types/hitDirection";
import { API_BASE_URL } from "@constants/api";
import axiosInstance from "@utils/axiosInstance";

const V2_HIT_DIRECTIONS_URL = `${API_BASE_URL}/api/v2/hit_directions`;

/**
 * 打球方向マスタを `zone_polygon` 込みで取得する。
 * 内野方向は単一ポリゴン、外野方向は深さ別の配列で返る。
 *
 * クライアント側はこの zone_polygon を使って `detectZone()` でタップ座標から
 * `hit_direction_id` / `hit_depth_id` を導出する。
 */
export const getHitDirections = async (): Promise<HitDirectionListResponse> => {
  const response = await axiosInstance.get<HitDirectionListResponse>(
    V2_HIT_DIRECTIONS_URL,
  );
  return response.data;
};

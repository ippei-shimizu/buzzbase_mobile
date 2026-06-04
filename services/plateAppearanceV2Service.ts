import type {
  PlateAppearanceListResponse,
  PlateAppearanceV2,
  PlateAppearanceV2Payload,
} from "../types/plateAppearance";
import { API_BASE_URL } from "@constants/api";
import axiosInstance from "@utils/axiosInstance";

const V2_PLATE_APPEARANCES_URL = `${API_BASE_URL}/api/v2/plate_appearances`;

/**
 * v2 打席記録を新規作成する。1 打席完了ボタンでリアルタイム保存される想定。
 * サーバー側で `batting_result` 文字列を自動生成し、`is_new_format = true` で保存される。
 *
 * @param payload `plate_appearance` をルートに持つリクエスト本体
 * @returns 作成された打席（マスタオブジェクトを include した形）
 */
export const createPlateAppearanceV2 = async (
  payload: PlateAppearanceV2Payload,
): Promise<PlateAppearanceV2> => {
  const response = await axiosInstance.post<PlateAppearanceV2>(
    V2_PLATE_APPEARANCES_URL,
    payload,
  );
  return response.data;
};

/**
 * v2 打席記録を部分更新する。
 *
 * @param id 対象 plate_appearance.id
 * @param payload 部分更新の `plate_appearance` 本体
 */
export const updatePlateAppearanceV2 = async (
  id: number,
  payload: PlateAppearanceV2Payload,
): Promise<PlateAppearanceV2> => {
  const response = await axiosInstance.patch<PlateAppearanceV2>(
    `${V2_PLATE_APPEARANCES_URL}/${id}`,
    payload,
  );
  return response.data;
};

/**
 * v2 打席記録を削除する。サーバー側で `batting_average` も再集計される。
 */
export const deletePlateAppearanceV2 = async (id: number): Promise<void> => {
  await axiosInstance.delete(`${V2_PLATE_APPEARANCES_URL}/${id}`);
};

/**
 * 試合単位で打席リストを取得する。
 * back 側は `batter_box_number` 昇順 + マスタ includes 済みで返す。
 */
export const getPlateAppearancesByGame = async (
  gameResultId: number,
): Promise<PlateAppearanceListResponse> => {
  const response = await axiosInstance.get<PlateAppearanceListResponse>(
    `${V2_PLATE_APPEARANCES_URL}/by_game/${gameResultId}`,
  );
  return response.data;
};

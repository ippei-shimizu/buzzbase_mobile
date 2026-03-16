import axiosInstance from "@utils/axiosInstance";
import type { TeamDetail } from "../types/profile";

/** GET /teams — チーム一覧取得（詳細版） */
export const getTeams = async (): Promise<TeamDetail[]> => {
  const response = await axiosInstance.get("/teams");
  return response.data;
};

/** POST /teams — チーム新規作成（カテゴリ・都道府県含む） */
export const createTeam = async (data: {
  name: string;
  category_id: number;
  prefecture_id: number;
}): Promise<TeamDetail> => {
  const response = await axiosInstance.post("/teams", { team: data });
  return response.data;
};

/** PUT /teams/:id — チーム更新 */
export const updateTeam = async (
  id: number,
  data: { name?: string; category_id?: number; prefecture_id?: number },
): Promise<TeamDetail> => {
  const response = await axiosInstance.put(`/teams/${id}`, { team: data });
  return response.data;
};

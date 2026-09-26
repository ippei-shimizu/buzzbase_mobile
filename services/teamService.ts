import axiosInstance from "@utils/axiosInstance";
import type { MyTeamResponse, TeamDetail } from "../types/profile";

/** GET /teams — チーム一覧取得（詳細版） */
export const getTeams = async (): Promise<TeamDetail[]> => {
  const response = await axiosInstance.get("/teams");
  return response.data;
};

/**
 * GET /teams/:user_id/my_team — ユーザーの所属チーム情報（チーム名・カテゴリ名・都道府県名）を取得。
 * teams 全件を取得して端末側で id 引き当てする方式は teams の増加とともに重くなるため、
 * サーバー側で解決済みの値を使う。
 */
export const getMyTeam = async (userId: string): Promise<MyTeamResponse> => {
  const response = await axiosInstance.get<MyTeamResponse>(
    `/teams/${userId}/my_team`,
  );
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

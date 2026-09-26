import type { MyTeamResponse, TeamDetail } from "../types/profile";
import axiosInstance from "@utils/axiosInstance";

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

/**
 * GET /teams?q=&limit= — チーム名の部分一致検索。
 * サジェスト用途のため全件取得は使わない（teams は単調増加するマスタ）。
 *
 * @param query 検索語。空文字のときは呼び出さない前提
 * @param limit 取得上限。サーバー側の上限は 100
 */
export const searchTeams = async (
  query: string,
  limit = 20,
): Promise<TeamDetail[]> => {
  const response = await axiosInstance.get<TeamDetail[]>("/teams", {
    params: { q: query, limit },
  });
  return response.data;
};

/**
 * POST /teams — チーム新規作成。
 * サーバー側が同じ属性のチームを find_or_initialize_by で引き当てるため、
 * カテゴリ・都道府県を省略すると「同名チームがあればそれを返す」挙動になる。
 */
export const createTeam = async (data: {
  name: string;
  category_id?: number;
  prefecture_id?: number;
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

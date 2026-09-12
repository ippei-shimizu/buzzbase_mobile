import type {
  MatchResultPayload,
  BattingAveragePayload,
  PitchingResultPayload,
  GameResultUpdatePayload,
  UpdateBattingAverageIdPayload,
  UpdatePitchingResultIdPayload,
  Team,
  Position,
} from "../types/gameRecord";
import axiosInstance from "@utils/axiosInstance";

/** POST /game_results — 空のgame_resultを作成 */
export const createGameResult = async (): Promise<{
  id: number;
  user_id: number;
}> => {
  const response = await axiosInstance.post("/game_results");
  return response.data;
};

/** PUT /game_results/:id — match_result_idを紐付け */
export const updateGameResult = async (
  id: number,
  data: GameResultUpdatePayload,
): Promise<void> => {
  await axiosInstance.put(`/game_results/${id}`, { game_result: data });
};

/** PUT /game_results/:id/update_batting_average_id */
export const updateBattingAverageId = async (
  id: number,
  data: UpdateBattingAverageIdPayload,
): Promise<void> => {
  await axiosInstance.put(`/game_results/${id}/update_batting_average_id`, {
    game_result: data,
  });
};

/** PUT /game_results/:id/update_pitching_result_id */
export const updatePitchingResultId = async (
  id: number,
  data: UpdatePitchingResultIdPayload,
): Promise<void> => {
  await axiosInstance.put(`/game_results/${id}/update_pitching_result_id`, {
    game_result: data,
  });
};

/** POST /match_results */
export const createMatchResult = async (
  data: MatchResultPayload,
): Promise<{ id: number }> => {
  const response = await axiosInstance.post("/match_results", {
    match_result: data,
  });
  return response.data;
};

/** POST /batting_averages */
export const createBattingAverage = async (
  data: BattingAveragePayload,
): Promise<{ id: number }> => {
  const response = await axiosInstance.post("/batting_averages", {
    batting_average: data,
  });
  return response.data;
};

/** POST /pitching_results */
export const createPitchingResult = async (
  data: PitchingResultPayload,
): Promise<{ id: number }> => {
  const response = await axiosInstance.post("/pitching_results", {
    pitching_result: data,
  });
  return response.data;
};

/**
 * GET /match_results/existing_search — 指定 game_result_id + user_id に紐づく match_result を取得する。
 * @returns 存在すれば { id }、存在しなければ null
 */
export const findExistingMatchResult = async (
  gameResultId: number,
  userId: number,
): Promise<{ id: number } | null> => {
  try {
    const response = await axiosInstance.get("/match_results/existing_search", {
      params: { game_result_id: gameResultId, user_id: userId },
    });
    return response.data;
  } catch {
    return null;
  }
};

/** PUT /match_results/:id */
export const updateMatchResult = async (
  id: number,
  data: MatchResultPayload,
): Promise<{ id: number }> => {
  const response = await axiosInstance.put(`/match_results/${id}`, {
    match_result: data,
  });
  return response.data;
};

/** PUT /batting_averages/:id */
export const updateBattingAverage = async (
  id: number,
  data: BattingAveragePayload,
): Promise<{ id: number }> => {
  const response = await axiosInstance.put(`/batting_averages/${id}`, {
    batting_average: data,
  });
  return response.data;
};

/** PUT /pitching_results/:id */
export const updatePitchingResult = async (
  id: number,
  data: PitchingResultPayload,
): Promise<{ id: number }> => {
  const response = await axiosInstance.put(`/pitching_results/${id}`, {
    pitching_result: data,
  });
  return response.data;
};

/**
 * GET /teams — チーム名のインクリメンタル検索。
 * teams は全ユーザー共有で単調増加するマスタのため全件取得はせず、
 * 検索語と件数上限を必ず付けて取得する。
 *
 * @param q 部分一致の検索語
 * @param limit 最大件数（サーバー既定 50 / 上限 100）
 */
export const searchTeams = async (
  q: string,
  limit: number = 20,
): Promise<Team[]> => {
  const response = await axiosInstance.get("/teams", { params: { q, limit } });
  return response.data;
};

/** GET /teams/:id/team_name — チーム ID からチーム名を解決する */
export const getTeamName = async (id: number): Promise<{ name: string }> => {
  const response = await axiosInstance.get(`/teams/${id}/team_name`);
  return response.data;
};

/** POST /teams — チーム新規作成 */
export const createTeam = async (name: string): Promise<Team> => {
  const response = await axiosInstance.post("/teams", { team: { name } });
  return response.data;
};

/** GET /positions — 守備位置一覧取得 */
export const getPositions = async (): Promise<Position[]> => {
  const response = await axiosInstance.get("/positions");
  return response.data;
};

/** GET /tournaments — 大会名一覧取得 */
export const getTournaments = async (): Promise<
  { id: number; name: string }[]
> => {
  const response = await axiosInstance.get("/tournaments");
  return response.data;
};

/** GET /tournaments/user_tournaments — ユーザーの試合に紐づく大会のみ取得 */
export const getUserTournaments = async (
  userId?: number,
): Promise<{ id: number; name: string }[]> => {
  const params = userId ? { user_id: userId } : {};
  const response = await axiosInstance.get("/tournaments/user_tournaments", {
    params,
  });
  return response.data;
};

/** POST /tournaments — 大会名新規作成 */
export const createTournament = async (
  name: string,
): Promise<{ id: number; name: string }> => {
  const response = await axiosInstance.post("/tournaments", {
    tournament: { name },
  });
  return response.data;
};

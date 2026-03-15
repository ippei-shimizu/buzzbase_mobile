import axiosInstance from "@utils/axiosInstance";
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

/** GET /teams — チーム一覧取得 */
export const getTeams = async (): Promise<Team[]> => {
  const response = await axiosInstance.get("/teams");
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

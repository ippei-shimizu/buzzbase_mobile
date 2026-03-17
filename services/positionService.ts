import axiosInstance from "@utils/axiosInstance";

/** POST /user_positions — ユーザーのポジション更新 */
export const updateUserPositions = async (
  userId: number,
  positionIds: number[],
): Promise<void> => {
  await axiosInstance.post("/user_positions", {
    user_id: userId,
    position_ids: positionIds,
  });
};

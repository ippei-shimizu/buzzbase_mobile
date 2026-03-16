import axiosInstance from "@utils/axiosInstance";
import type { Award } from "../types/profile";

/** GET /users/:userId/awards — ユーザーの受賞歴取得 */
export const getUserAwards = async (userId: number): Promise<Award[]> => {
  const response = await axiosInstance.get(`/users/${userId}/awards`);
  return response.data;
};

/** POST /users/:userId/awards — 受賞歴作成 */
export const createAward = async (
  userId: number,
  title: string,
): Promise<Award> => {
  const response = await axiosInstance.post(`/users/${userId}/awards`, {
    award: { title },
  });
  return response.data;
};

/** PUT /users/:userId/awards/:awardId — 受賞歴更新 */
export const updateAward = async (
  userId: number,
  awardId: number,
  title: string,
): Promise<Award> => {
  const response = await axiosInstance.put(
    `/users/${userId}/awards/${awardId}`,
    { award: { title } },
  );
  return response.data;
};

/** DELETE /users/:userId/awards/:awardId — 受賞歴削除 */
export const deleteAward = async (
  userId: number,
  awardId: number,
): Promise<void> => {
  await axiosInstance.delete(`/users/${userId}/awards/${awardId}`);
};

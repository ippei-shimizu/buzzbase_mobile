import type {
  ShadowSwingSession,
  ShadowSwingStats,
} from "../types/shadowSwing";
import { API_BASE_URL } from "@constants/api";
import axiosInstance from "@utils/axiosInstance";

const URL = `${API_BASE_URL}/api/v2/shadow_swing_sessions`;

export const startShadowSwingSession = async (
  targetCount: number,
): Promise<ShadowSwingSession> => {
  const res = await axiosInstance.post<ShadowSwingSession>(URL, {
    shadow_swing_session: { target_count: targetCount },
  });
  return res.data;
};

export const completeShadowSwingSession = async (
  id: number,
  swingCount: number,
): Promise<ShadowSwingSession> => {
  const res = await axiosInstance.post<ShadowSwingSession>(
    `${URL}/${id}/complete`,
    { shadow_swing_session: { swing_count: swingCount } },
  );
  return res.data;
};

export const getShadowSwingStats = async (): Promise<ShadowSwingStats> => {
  const res = await axiosInstance.get<ShadowSwingStats>(`${URL}/stats`);
  return res.data;
};

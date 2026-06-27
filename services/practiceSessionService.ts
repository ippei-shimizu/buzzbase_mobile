import type { PracticeSession, PracticeSessionInput } from "../types/practice";
import { API_BASE_URL } from "@constants/api";
import axiosInstance from "@utils/axiosInstance";

const URL = `${API_BASE_URL}/api/v2/practice_sessions`;

export const getPracticeSessions = async (params?: {
  from?: string;
  to?: string;
}): Promise<PracticeSession[]> => {
  const res = await axiosInstance.get<PracticeSession[]>(URL, { params });
  return res.data;
};

export const getPracticeSessionByDate = async (
  date: string,
): Promise<PracticeSession | null> => {
  const res = await axiosInstance.get<PracticeSession | null>(
    `${URL}/by_date`,
    { params: { date } },
  );
  return res.data;
};

export const upsertPracticeSession = async (
  input: PracticeSessionInput,
): Promise<PracticeSession> => {
  const res = await axiosInstance.post<PracticeSession>(URL, {
    practice_session: input,
  });
  return res.data;
};

export const deletePracticeSession = async (id: number): Promise<void> => {
  await axiosInstance.delete(`${URL}/${id}`);
};

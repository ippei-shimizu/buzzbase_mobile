import type { Schedule, ScheduleInput } from "../types/schedule";
import { API_BASE_URL } from "@constants/api";
import axiosInstance from "@utils/axiosInstance";

const URL = `${API_BASE_URL}/api/v2/schedules`;

export const getSchedules = async (): Promise<Schedule[]> => {
  const res = await axiosInstance.get<Schedule[]>(URL);
  return res.data;
};

export const createSchedule = async (
  input: ScheduleInput,
): Promise<Schedule> => {
  const res = await axiosInstance.post<Schedule>(URL, { schedule: input });
  return res.data;
};

export const updateSchedule = async (
  id: number,
  input: ScheduleInput,
): Promise<Schedule> => {
  const res = await axiosInstance.patch<Schedule>(`${URL}/${id}`, {
    schedule: input,
  });
  return res.data;
};

export const deleteSchedule = async (id: number): Promise<void> => {
  await axiosInstance.delete(`${URL}/${id}`);
};

/** 指定週（週始めのISO日付）の単発予定を翌週へ一括コピーする（Pro限定）。 */
export const copyScheduleWeekToNext = async (
  weekStart: string,
): Promise<Schedule[]> => {
  const res = await axiosInstance.post<Schedule[]>(`${URL}/week_copy`, {
    week_start: weekStart,
  });
  return res.data;
};

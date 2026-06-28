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

export const deleteSchedule = async (id: number): Promise<void> => {
  await axiosInstance.delete(`${URL}/${id}`);
};

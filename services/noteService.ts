import type { NoteInput, NoteV2 } from "../types/note";
import { API_BASE_URL } from "@constants/api";
import axiosInstance from "@utils/axiosInstance";

const URL = `${API_BASE_URL}/api/v2/baseball_notes`;

export const getNotes = async (params?: {
  date?: string;
  practice_log_id?: number;
  game_result_id?: number;
}): Promise<NoteV2[]> => {
  const res = await axiosInstance.get<NoteV2[]>(URL, { params });
  return res.data;
};

export const createNote = async (input: NoteInput): Promise<NoteV2> => {
  const res = await axiosInstance.post<NoteV2>(URL, { baseball_note: input });
  return res.data;
};

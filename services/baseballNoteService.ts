import axiosInstance from "@utils/axiosInstance";
import type {
  BaseballNote,
  BaseballNoteListItem,
  BaseballNoteParams,
} from "../types/baseballNote";

export const getBaseballNotes = async (): Promise<BaseballNoteListItem[]> => {
  const response =
    await axiosInstance.get<BaseballNoteListItem[]>("/baseball_notes");
  return response.data;
};

export const getBaseballNote = async (id: number): Promise<BaseballNote> => {
  const response = await axiosInstance.get<BaseballNote>(
    `/baseball_notes/${id}`,
  );
  return response.data;
};

export const createBaseballNote = async (
  params: BaseballNoteParams,
): Promise<BaseballNote> => {
  const response = await axiosInstance.post<BaseballNote>("/baseball_notes", {
    baseball_note: params,
  });
  return response.data;
};

export const updateBaseballNote = async (
  id: number,
  params: BaseballNoteParams,
): Promise<BaseballNote> => {
  const response = await axiosInstance.patch<BaseballNote>(
    `/baseball_notes/${id}`,
    { baseball_note: params },
  );
  return response.data;
};

export const deleteBaseballNote = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/baseball_notes/${id}`);
};

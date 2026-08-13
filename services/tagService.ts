import type { Tag, TagInput } from "../types/tag";
import { API_BASE_URL } from "@constants/api";
import axiosInstance from "@utils/axiosInstance";

const URL = `${API_BASE_URL}/api/v2/note_tags`;

export const getTags = async (): Promise<Tag[]> => {
  const res = await axiosInstance.get<Tag[]>(URL);
  return res.data;
};

export const createTag = async (input: TagInput): Promise<Tag> => {
  const res = await axiosInstance.post<Tag>(URL, { note_tag: input });
  return res.data;
};

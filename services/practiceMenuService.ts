import type { PracticeMenu, PracticeMenuInput } from "../types/practice";
import { API_BASE_URL } from "@constants/api";
import axiosInstance from "@utils/axiosInstance";

const URL = `${API_BASE_URL}/api/v2/practice_menus`;

export const getPracticeMenus = async (): Promise<PracticeMenu[]> => {
  const res = await axiosInstance.get<PracticeMenu[]>(URL);
  return res.data;
};

export const createPracticeMenu = async (
  input: PracticeMenuInput,
): Promise<PracticeMenu> => {
  const res = await axiosInstance.post<PracticeMenu>(URL, {
    practice_menu: input,
  });
  return res.data;
};

export const updatePracticeMenu = async (
  id: number,
  input: Partial<PracticeMenuInput>,
): Promise<PracticeMenu> => {
  const res = await axiosInstance.patch<PracticeMenu>(`${URL}/${id}`, {
    practice_menu: input,
  });
  return res.data;
};

export const deletePracticeMenu = async (id: number): Promise<void> => {
  await axiosInstance.delete(`${URL}/${id}`);
};

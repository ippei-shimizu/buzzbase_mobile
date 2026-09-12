import type { MenuSet, MenuSetInput } from "../types/menuSet";
import { API_BASE_URL } from "@constants/api";
import axiosInstance from "@utils/axiosInstance";

const URL = `${API_BASE_URL}/api/v2/menu_sets`;

export const getMenuSets = async (): Promise<MenuSet[]> => {
  const res = await axiosInstance.get<MenuSet[]>(URL);
  return res.data;
};

export const createMenuSet = async (input: MenuSetInput): Promise<MenuSet> => {
  const res = await axiosInstance.post<MenuSet>(URL, { menu_set: input });
  return res.data;
};

export const updateMenuSet = async (
  id: number,
  input: MenuSetInput,
): Promise<MenuSet> => {
  const res = await axiosInstance.patch<MenuSet>(`${URL}/${id}`, {
    menu_set: input,
  });
  return res.data;
};

export const deleteMenuSet = async (id: number): Promise<void> => {
  await axiosInstance.delete(`${URL}/${id}`);
};

import type {
  ImprovementTheme,
  ImprovementThemeInput,
  ImprovementThemeStatus,
} from "../types/improvementTheme";
import { API_BASE_URL } from "@constants/api";
import axiosInstance from "@utils/axiosInstance";

const URL = `${API_BASE_URL}/api/v2/improvement_themes`;

export const getImprovementThemes = async (params?: {
  status?: ImprovementThemeStatus;
}): Promise<ImprovementTheme[]> => {
  const res = await axiosInstance.get<ImprovementTheme[]>(URL, { params });
  return res.data;
};

export const createImprovementTheme = async (
  input: ImprovementThemeInput,
): Promise<ImprovementTheme> => {
  const res = await axiosInstance.post<ImprovementTheme>(URL, {
    improvement_theme: input,
  });
  return res.data;
};

export const updateImprovementTheme = async (
  id: number,
  input: ImprovementThemeInput,
): Promise<ImprovementTheme> => {
  const res = await axiosInstance.patch<ImprovementTheme>(`${URL}/${id}`, {
    improvement_theme: input,
  });
  return res.data;
};

export const deleteImprovementTheme = async (id: number): Promise<void> => {
  await axiosInstance.delete(`${URL}/${id}`);
};

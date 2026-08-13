import type {
  ReflectionTemplate,
  ReflectionTemplateInput,
} from "../types/reflectionTemplate";
import { API_BASE_URL } from "@constants/api";
import axiosInstance from "@utils/axiosInstance";

const URL = `${API_BASE_URL}/api/v2/reflection_templates`;

export const getReflectionTemplates = async (): Promise<
  ReflectionTemplate[]
> => {
  const res = await axiosInstance.get<ReflectionTemplate[]>(URL);
  return res.data;
};

export const createReflectionTemplate = async (
  input: ReflectionTemplateInput,
): Promise<ReflectionTemplate> => {
  const res = await axiosInstance.post<ReflectionTemplate>(URL, {
    reflection_template: input,
  });
  return res.data;
};

export const updateReflectionTemplate = async (
  id: number,
  input: ReflectionTemplateInput,
): Promise<ReflectionTemplate> => {
  const res = await axiosInstance.patch<ReflectionTemplate>(`${URL}/${id}`, {
    reflection_template: input,
  });
  return res.data;
};

export const deleteReflectionTemplate = async (id: number): Promise<void> => {
  await axiosInstance.delete(`${URL}/${id}`);
};

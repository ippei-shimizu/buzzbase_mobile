import axiosInstance from "@utils/axiosInstance";
import type { SearchUser } from "../types/user";

export const searchUsers = async (query: string): Promise<SearchUser[]> => {
  const response = await axiosInstance.get<SearchUser[]>("/users/search", {
    params: { query },
  });
  return response.data;
};

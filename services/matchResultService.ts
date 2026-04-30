import axiosInstance from "@utils/axiosInstance";

export const getAvailableYears = async (userId?: number): Promise<string[]> => {
  const params = userId ? { user_id: userId } : {};
  const response = await axiosInstance.get<string[]>(
    "/match_results/available_years",
    { params },
  );
  return response.data;
};

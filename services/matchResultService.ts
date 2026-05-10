import axiosInstance from "@utils/axiosInstance";

export const getAvailableYears = async (userId?: number): Promise<string[]> => {
  const params = userId ? { user_id: userId } : {};
  const response = await axiosInstance.get<string[]>(
    "/match_results/available_years",
    { params },
  );
  return response.data;
};

/**
 * 試合作成フォームの初期値を取得する。
 * 直近試合の inning_format（7 or 9）を返す。履歴がない場合は 9。
 */
export const getMatchResultFormDefaults = async (): Promise<{
  inning_format: number;
}> => {
  const response = await axiosInstance.get<{ inning_format: number }>(
    "/match_results/form_defaults",
  );
  return response.data;
};

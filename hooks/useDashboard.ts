import { useQuery } from "@tanstack/react-query";
import { getDashboardData } from "../services/dashboardService";

export const useDashboard = () => {
  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboardData,
  });

  return {
    data,
    isLoading,
    isError,
    error,
    refetch,
    // 初回ロード中の isRefetching は RefreshControl と二重表示になるため抑制する（issue #341）
    isRefreshing: isRefetching && !isLoading,
  };
};

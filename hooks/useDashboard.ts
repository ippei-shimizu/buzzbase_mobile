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
    isRefreshing: isRefetching,
  };
};

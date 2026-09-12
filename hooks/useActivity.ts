import { useQuery } from "@tanstack/react-query";
import { getHeatmap, getStreak } from "../services/activityService";

export const useActivityHeatmap = (params?: { from?: string; to?: string }) => {
  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ["activityLogs", params ?? {}],
    queryFn: () => getHeatmap(params),
  });
  return {
    heatmap: data ?? null,
    isLoading,
    isError,
    refetch,
    isRefreshing: isRefetching,
  };
};

export const useStreak = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["streak"],
    queryFn: getStreak,
  });
  return { streak: data ?? null, isLoading };
};

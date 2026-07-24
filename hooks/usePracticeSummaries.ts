import { useQuery } from "@tanstack/react-query";
import {
  getMenuSummaries,
  getMenuTrend,
  getPracticeOverview,
} from "../services/practiceSummaryService";

export const usePracticeSummaries = () => {
  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ["practiceSummaries"],
    queryFn: getMenuSummaries,
  });
  return {
    summaries: data ?? [],
    isLoading,
    isError,
    refetch,
    isRefreshing: isRefetching,
  };
};

export const usePracticeOverview = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["practiceOverview"],
    queryFn: getPracticeOverview,
  });
  return { overview: data ?? null, isLoading };
};

export const useMenuTrend = (
  menuId: number | null,
  options?: { enabled?: boolean },
) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["menuTrend", menuId],
    queryFn: () => getMenuTrend(menuId as number),
    enabled: (options?.enabled ?? true) && menuId != null,
  });
  return { trend: data ?? null, isLoading, isError };
};

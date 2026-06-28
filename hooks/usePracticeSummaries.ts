import { useQuery } from "@tanstack/react-query";
import { getMenuSummaries } from "../services/practiceSummaryService";

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

import { useQuery } from "@tanstack/react-query";
import { getCorrelationInsights } from "../services/correlationInsightService";

export const useCorrelationInsights = (options?: { enabled?: boolean }) => {
  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ["correlationInsights"],
    queryFn: getCorrelationInsights,
    enabled: options?.enabled ?? true,
  });
  return {
    insights: data?.insights ?? [],
    isLoading,
    isError,
    refetch,
    isRefreshing: isRefetching,
  };
};

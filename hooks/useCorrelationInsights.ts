import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createInsightCombination,
  deleteInsightCombination,
  getCorrelationInsights,
} from "../services/correlationInsightService";

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

export const useInsightCombinationMutations = () => {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["correlationInsights"] });

  const create = useMutation({
    mutationFn: createInsightCombination,
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: deleteInsightCombination,
    onSuccess: invalidate,
  });

  return {
    createCombination: create.mutateAsync,
    isCreating: create.isPending,
    deleteCombination: remove.mutateAsync,
    isDeleting: remove.isPending,
  };
};

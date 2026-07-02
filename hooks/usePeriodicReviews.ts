import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getPeriodicReviews,
  markPeriodicReviewRead,
} from "../services/periodicReviewService";

export const usePeriodicReviews = () => {
  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ["periodicReviews"],
    queryFn: getPeriodicReviews,
  });
  return {
    reviews: data ?? [],
    isLoading,
    isError,
    refetch,
    isRefreshing: isRefetching,
  };
};

export const usePeriodicReviewMutations = () => {
  const queryClient = useQueryClient();
  const markRead = useMutation({
    mutationFn: markPeriodicReviewRead,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["periodicReviews"] }),
  });
  return {
    markRead: markRead.mutateAsync,
    isMarking: markRead.isPending,
  };
};

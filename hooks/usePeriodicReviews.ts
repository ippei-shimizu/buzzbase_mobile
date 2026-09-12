import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
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
  // 複数件の未読を一括で既読化する。一括APIが無いため個別リクエストを並列実行するが、
  // invalidate はまとめて1回だけ行う（1件ごとの再フェッチの重複を防ぐ）。
  const markReadMany = useCallback(
    async (ids: number[]) => {
      await Promise.allSettled(ids.map((id) => markPeriodicReviewRead(id)));
      await queryClient.invalidateQueries({ queryKey: ["periodicReviews"] });
    },
    [queryClient],
  );
  return {
    markRead: markRead.mutateAsync,
    isMarking: markRead.isPending,
    markReadMany,
  };
};

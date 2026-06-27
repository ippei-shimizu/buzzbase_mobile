import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPracticeLog,
  deletePracticeLog,
  getPracticeLogs,
} from "../services/practiceLogService";

export const usePracticeLogs = (params?: { from?: string; to?: string }) => {
  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ["practiceLogs", params ?? {}],
    queryFn: () => getPracticeLogs(params),
  });
  return {
    logs: data ?? [],
    isLoading,
    isError,
    refetch,
    isRefreshing: isRefetching,
  };
};

export const usePracticeLogMutations = () => {
  const queryClient = useQueryClient();
  // 練習ログの変化は当日の活動集計（草・Streak）に波及するため関連キャッシュを失効する。
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["practiceLogs"] });
    queryClient.invalidateQueries({ queryKey: ["activityLogs"] });
    queryClient.invalidateQueries({ queryKey: ["streak"] });
  };

  const create = useMutation({
    mutationFn: createPracticeLog,
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: deletePracticeLog,
    onSuccess: invalidate,
  });

  return {
    createLog: create.mutateAsync,
    isCreating: create.isPending,
    deleteLog: remove.mutateAsync,
  };
};

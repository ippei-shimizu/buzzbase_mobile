import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  completeShadowSwingSession,
  getShadowSwingStats,
  startShadowSwingSession,
} from "../services/shadowSwingService";

export const useShadowSwingStats = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["shadowSwingStats"],
    queryFn: getShadowSwingStats,
  });
  return { stats: data ?? null, isLoading };
};

export const useShadowSwingMutations = () => {
  const queryClient = useQueryClient();

  const start = useMutation({ mutationFn: startShadowSwingSession });
  const complete = useMutation({
    mutationFn: ({ id, swingCount }: { id: number; swingCount: number }) =>
      completeShadowSwingSession(id, swingCount),
    onSuccess: () => {
      // 素振り完了は当日の活動集計（草・Streak）に波及する。
      queryClient.invalidateQueries({ queryKey: ["shadowSwingStats"] });
      queryClient.invalidateQueries({ queryKey: ["practiceLogs"] });
      queryClient.invalidateQueries({ queryKey: ["activityLogs"] });
      queryClient.invalidateQueries({ queryKey: ["streak"] });
    },
  });

  return {
    startSession: start.mutateAsync,
    isStarting: start.isPending,
    completeSession: complete.mutateAsync,
    isCompleting: complete.isPending,
  };
};

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deletePracticeSession,
  getPracticeSessionByDate,
  getPracticeSessions,
  upsertPracticeSession,
} from "../services/practiceSessionService";

export const usePracticeSessions = (params?: {
  from?: string;
  to?: string;
}) => {
  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ["practiceSessions", params ?? {}],
    queryFn: () => getPracticeSessions(params),
  });
  return {
    sessions: data ?? [],
    isLoading,
    isError,
    refetch,
    isRefreshing: isRefetching,
  };
};

export const usePracticeSessionByDate = (date: string) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["practiceSession", date],
    queryFn: () => getPracticeSessionByDate(date),
  });
  return { session: data ?? null, isLoading, isError };
};

export const usePracticeSessionMutations = () => {
  const queryClient = useQueryClient();
  // セッション保存は当日の量ログ・コンディション・活動集計（草・Streak）に波及する。
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["practiceSessions"] });
    queryClient.invalidateQueries({ queryKey: ["practiceSession"] });
    queryClient.invalidateQueries({ queryKey: ["practiceLogs"] });
    queryClient.invalidateQueries({ queryKey: ["activityLogs"] });
    queryClient.invalidateQueries({ queryKey: ["streak"] });
  };

  const upsert = useMutation({
    mutationFn: upsertPracticeSession,
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: deletePracticeSession,
    onSuccess: invalidate,
  });

  return {
    saveSession: upsert.mutateAsync,
    isSaving: upsert.isPending,
    deleteSession: remove.mutateAsync,
  };
};

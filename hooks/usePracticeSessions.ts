import type { PracticeSessionInput } from "../types/practice";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deletePracticeSession,
  getPracticeSession,
  getPracticeSessionByDate,
  getPracticeSessions,
  upsertPracticeSession,
} from "../services/practiceSessionService";
import { trackPracticeRecordCreated } from "@utils/analytics";

export const usePracticeSessions = (params?: {
  from?: string;
  to?: string;
  improvement_theme_id?: number;
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

export const usePracticeSession = (id: number | null) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["practiceSession", "id", id],
    queryFn: () => getPracticeSession(id as number),
    enabled: id != null,
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

  // 保存は日付キーの upsert なので、呼び出し側から新規・編集を受け取って計測に渡す。
  // レスポンスからは判別できず、イベント件数を「作成数」として読めなくなるため。
  const upsert = useMutation({
    mutationFn: ({ input }: { input: PracticeSessionInput; isEdit: boolean }) =>
      upsertPracticeSession(input),
    onSuccess: (_data, { input, isEdit }) => {
      invalidate();
      trackPracticeRecordCreated({
        menu_count: input.items.length,
        has_condition: input.condition != null,
        is_edit: isEdit,
      });
    },
  });
  const remove = useMutation({
    mutationFn: deletePracticeSession,
    onSuccess: invalidate,
  });

  return {
    saveSession: upsert.mutateAsync,
    isSaving: upsert.isPending,
    deleteSession: remove.mutateAsync,
    isDeleting: remove.isPending,
  };
};

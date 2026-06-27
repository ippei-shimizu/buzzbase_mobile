import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getConditionLogByDate,
  upsertConditionLog,
} from "../services/conditionLogService";

export const useConditionLog = (date: string) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["conditionLog", date],
    queryFn: () => getConditionLogByDate(date),
  });
  return { conditionLog: data ?? null, isLoading, isError };
};

export const useConditionLogMutations = (date: string) => {
  const queryClient = useQueryClient();
  const upsert = useMutation({
    mutationFn: upsertConditionLog,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["conditionLog", date] }),
  });
  return { saveCondition: upsert.mutateAsync, isSaving: upsert.isPending };
};

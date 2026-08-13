import type { ScheduleInput } from "../types/schedule";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createSchedule,
  deleteSchedule,
  getSchedules,
  updateSchedule,
} from "../services/scheduleService";

export const useSchedules = () => {
  const { data, isLoading, isError, refetch, isSuccess } = useQuery({
    queryKey: ["schedules"],
    queryFn: getSchedules,
  });
  // isSuccess は「サーバーの予定一覧を実際に取得できた」ことを表す。取得前・取得失敗時の
  // 空配列を「予定ゼロ」と解釈されるとローカル通知の全消去などの破壊的な同期が走るため、
  // 呼び出し側が両者を区別できるように公開する。
  return { schedules: data ?? [], isLoading, isError, isSuccess, refetch };
};

export const useScheduleMutations = () => {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["schedules"] });
    queryClient.invalidateQueries({ queryKey: ["plans"] });
  };

  const create = useMutation({
    mutationFn: createSchedule,
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: ({ id, input }: { id: number; input: ScheduleInput }) =>
      updateSchedule(id, input),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: deleteSchedule,
    onSuccess: invalidate,
  });

  return {
    createSchedule: create.mutateAsync,
    isCreating: create.isPending,
    updateSchedule: update.mutateAsync,
    isUpdating: update.isPending,
    deleteSchedule: remove.mutateAsync,
  };
};

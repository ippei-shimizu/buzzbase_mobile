import type { ScheduleInput } from "../types/schedule";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createSchedule,
  deleteSchedule,
  getSchedules,
  updateSchedule,
} from "../services/scheduleService";

export const useSchedules = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["schedules"],
    queryFn: getSchedules,
  });
  return { schedules: data ?? [], isLoading, isError, refetch };
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

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createSchedule,
  deleteSchedule,
  getSchedules,
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
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["schedules"] });

  const create = useMutation({
    mutationFn: createSchedule,
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: deleteSchedule,
    onSuccess: invalidate,
  });

  return {
    createSchedule: create.mutateAsync,
    isCreating: create.isPending,
    deleteSchedule: remove.mutateAsync,
  };
};

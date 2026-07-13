import type { GoalInput } from "../types/goal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  achieveGoal,
  createGoal,
  deleteGoal,
  getGoalHistory,
  getGoals,
  unachieveGoal,
  updateGoal,
} from "../services/goalService";

export const useGoals = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["goals"],
    queryFn: getGoals,
  });
  return { goals: data ?? [], isLoading, isError, refetch };
};

/** 確定済み（期限到来）の目標履歴。達成・未達タブの表示に使う。 */
export const useGoalHistory = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["goalHistory"],
    queryFn: getGoalHistory,
  });
  return { goals: data ?? [], isLoading, isError, refetch };
};

export const useGoalMutations = () => {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["goals"] });
    queryClient.invalidateQueries({ queryKey: ["goalHistory"] });
  };

  const create = useMutation({ mutationFn: createGoal, onSuccess: invalidate });
  const update = useMutation({
    mutationFn: ({ id, input }: { id: number; input: GoalInput }) =>
      updateGoal(id, input),
    onSuccess: invalidate,
  });
  const remove = useMutation({ mutationFn: deleteGoal, onSuccess: invalidate });
  const achieve = useMutation({
    mutationFn: achieveGoal,
    onSuccess: invalidate,
  });
  const unachieve = useMutation({
    mutationFn: unachieveGoal,
    onSuccess: invalidate,
  });

  return {
    createGoal: create.mutateAsync,
    isCreating: create.isPending,
    updateGoal: update.mutateAsync,
    isUpdating: update.isPending,
    deleteGoal: remove.mutateAsync,
    achieveGoal: achieve.mutateAsync,
    unachieveGoal: unachieve.mutateAsync,
  };
};

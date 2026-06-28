import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createGoal, deleteGoal, getGoals } from "../services/goalService";

export const useGoals = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["goals"],
    queryFn: getGoals,
  });
  return { goals: data ?? [], isLoading, isError, refetch };
};

export const useGoalMutations = () => {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["goals"] });

  const create = useMutation({ mutationFn: createGoal, onSuccess: invalidate });
  const remove = useMutation({ mutationFn: deleteGoal, onSuccess: invalidate });

  return {
    createGoal: create.mutateAsync,
    isCreating: create.isPending,
    deleteGoal: remove.mutateAsync,
  };
};

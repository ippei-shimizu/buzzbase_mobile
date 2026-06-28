import type { PracticeMenuInput } from "../types/practice";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPracticeMenu,
  deletePracticeMenu,
  getPracticeMenus,
  updatePracticeMenu,
} from "../services/practiceMenuService";

export const usePracticeMenus = () => {
  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ["practiceMenus"],
    queryFn: getPracticeMenus,
  });
  return {
    menus: data ?? [],
    isLoading,
    isError,
    refetch,
    isRefreshing: isRefetching,
  };
};

export const usePracticeMenuMutations = () => {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["practiceMenus"] });

  const create = useMutation({
    mutationFn: createPracticeMenu,
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number;
      input: Partial<PracticeMenuInput>;
    }) => updatePracticeMenu(id, input),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: deletePracticeMenu,
    onSuccess: invalidate,
  });

  return {
    createMenu: create.mutateAsync,
    isCreating: create.isPending,
    updateMenu: update.mutateAsync,
    deleteMenu: remove.mutateAsync,
  };
};

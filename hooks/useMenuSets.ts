import type { MenuSetInput } from "../types/menuSet";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createMenuSet,
  deleteMenuSet,
  getMenuSets,
  updateMenuSet,
} from "../services/menuSetService";

export const useMenuSets = () => {
  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ["menuSets"],
    queryFn: getMenuSets,
  });
  return {
    menuSets: data ?? [],
    isLoading,
    isError,
    refetch,
    isRefreshing: isRefetching,
  };
};

export const useMenuSetMutations = () => {
  const queryClient = useQueryClient();
  // メニューセットの変更は、それを参照する予定（今日のやること）にも波及する。
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["menuSets"] });
    queryClient.invalidateQueries({ queryKey: ["plans"] });
  };

  const create = useMutation({
    mutationFn: createMenuSet,
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: ({ id, input }: { id: number; input: MenuSetInput }) =>
      updateMenuSet(id, input),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: deleteMenuSet,
    onSuccess: invalidate,
  });

  return {
    createMenuSet: create.mutateAsync,
    isCreating: create.isPending,
    updateMenuSet: update.mutateAsync,
    isUpdating: update.isPending,
    deleteMenuSet: remove.mutateAsync,
  };
};

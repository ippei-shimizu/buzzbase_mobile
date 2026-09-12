import type {
  ImprovementThemeInput,
  ImprovementThemeStatus,
} from "../types/improvementTheme";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createImprovementTheme,
  deleteImprovementTheme,
  getImprovementThemes,
  updateImprovementTheme,
} from "../services/improvementThemeService";

export const useImprovementThemes = (params?: {
  status?: ImprovementThemeStatus;
}) => {
  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ["improvementThemes", params ?? {}],
    queryFn: () => getImprovementThemes(params),
  });
  return {
    themes: data ?? [],
    isLoading,
    isError,
    refetch,
    isRefreshing: isRefetching,
  };
};

export const useImprovementThemeMutations = () => {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["improvementThemes"] });
    queryClient.invalidateQueries({ queryKey: ["practiceSessions"] });
    queryClient.invalidateQueries({ queryKey: ["notesV2"] });
  };

  const create = useMutation({
    mutationFn: createImprovementTheme,
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: ({ id, input }: { id: number; input: ImprovementThemeInput }) =>
      updateImprovementTheme(id, input),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: deleteImprovementTheme,
    onSuccess: invalidate,
  });

  return {
    createTheme: create.mutateAsync,
    isCreating: create.isPending,
    updateTheme: update.mutateAsync,
    isUpdating: update.isPending,
    deleteTheme: remove.mutateAsync,
    isDeleting: remove.isPending,
  };
};

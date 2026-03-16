import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createSeason,
  updateSeason,
  deleteSeason,
} from "../services/seasonService";

export const useCreateSeason = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createSeason,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seasons"] });
    },
  });

  return {
    createSeason: mutation.mutateAsync,
    isCreating: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
};

export const useUpdateSeason = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      id,
      params,
    }: {
      id: number;
      params: Parameters<typeof updateSeason>[1];
    }) => updateSeason(id, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seasons"] });
    },
  });

  return {
    updateSeason: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
};

export const useDeleteSeason = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: deleteSeason,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seasons"] });
    },
  });

  return {
    deleteSeason: mutation.mutateAsync,
    isDeleting: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
};

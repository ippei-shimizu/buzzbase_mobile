import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createBaseballNote,
  updateBaseballNote,
  deleteBaseballNote,
} from "../services/baseballNoteService";

export const useCreateBaseballNote = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createBaseballNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["baseballNotes"] });
    },
  });

  return {
    createNote: mutation.mutateAsync,
    isCreating: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
};

export const useUpdateBaseballNote = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      id,
      params,
    }: {
      id: number;
      params: Parameters<typeof updateBaseballNote>[1];
    }) => updateBaseballNote(id, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["baseballNotes"] });
      queryClient.invalidateQueries({ queryKey: ["baseballNote"] });
    },
  });

  return {
    updateNote: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
};

export const useDeleteBaseballNote = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: deleteBaseballNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["baseballNotes"] });
    },
  });

  return {
    deleteNote: mutation.mutateAsync,
    isDeleting: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
};

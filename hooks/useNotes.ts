import type { NoteInput } from "../types/note";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createNote,
  getNote,
  getNotes,
  updateNote,
} from "../services/noteService";

export const useNotes = (params?: {
  date?: string;
  practice_log_id?: number;
}) => {
  const { data, isLoading } = useQuery({
    queryKey: ["notesV2", params ?? {}],
    queryFn: () => getNotes(params),
  });
  return { notes: data ?? [], isLoading };
};

export const useNote = (id: number) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["note", id],
    queryFn: () => getNote(id),
    enabled: Number.isFinite(id),
  });
  return { note: data ?? null, isLoading, isError };
};

export const useNoteMutations = () => {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["notesV2"] });

  const create = useMutation({
    mutationFn: createNote,
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: ({ id, input }: { id: number; input: NoteInput }) =>
      updateNote(id, input),
    onSuccess: (_data, variables) => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["note", variables.id] });
    },
  });

  return {
    createNote: create.mutateAsync,
    isCreating: create.isPending,
    updateNote: update.mutateAsync,
    isUpdating: update.isPending,
  };
};

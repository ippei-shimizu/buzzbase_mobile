import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createNote, getNotes } from "../services/noteService";

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

export const useNoteMutations = () => {
  const queryClient = useQueryClient();
  const create = useMutation({
    mutationFn: createNote,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notesV2"] }),
  });
  return { createNote: create.mutateAsync, isCreating: create.isPending };
};

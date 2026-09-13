import type { NoteInput } from "../types/note";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createNote,
  deleteNote,
  getNote,
  getNotes,
  updateNote,
} from "../services/noteService";
import { trackNoteCreated, trackReviewCompleted } from "@utils/analytics";

export const useNotes = (params?: {
  date?: string;
  practice_log_id?: number;
  improvement_theme_id?: number;
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
    onSuccess: (_data, input) => {
      invalidate();
      const answerCount = input.reflection_answers?.length ?? 0;
      trackNoteCreated({ has_reflection: answerCount > 0 });
      // 振り返りは「テンプレに回答したノート」として保存されるため、ノート作成と
      // 同時に振り返り完了としても数える（機能別の使用率を別々に出すため）。
      if (answerCount > 0) trackReviewCompleted({ answer_count: answerCount });
    },
  });
  const update = useMutation({
    mutationFn: ({ id, input }: { id: number; input: NoteInput }) =>
      updateNote(id, input),
    onSuccess: (_data, variables) => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["note", variables.id] });
    },
  });
  const remove = useMutation({
    mutationFn: deleteNote,
    onSuccess: invalidate,
  });

  return {
    createNote: create.mutateAsync,
    isCreating: create.isPending,
    updateNote: update.mutateAsync,
    isUpdating: update.isPending,
    deleteNote: remove.mutateAsync,
    isDeleting: remove.isPending,
  };
};

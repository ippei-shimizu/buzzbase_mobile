import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  deleteMediaAttachment,
  updateMediaAttachmentMemo,
} from "../services/mediaAttachmentService";

export const useMediaAttachmentMutations = () => {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["notesV2"] });
    queryClient.invalidateQueries({ queryKey: ["note"] });
  };

  const remove = useMutation({
    mutationFn: deleteMediaAttachment,
    onSuccess: invalidate,
  });

  const updateMemo = useMutation({
    mutationFn: ({ id, memo }: { id: number; memo: string }) =>
      updateMediaAttachmentMemo(id, { memo }),
    onSuccess: invalidate,
  });

  return {
    deleteMediaAttachment: remove.mutateAsync,
    isDeleting: remove.isPending,
    updateMediaAttachmentMemo: updateMemo.mutateAsync,
    isUpdatingMemo: updateMemo.isPending,
  };
};

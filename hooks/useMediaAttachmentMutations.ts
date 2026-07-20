import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteMediaAttachment } from "../services/mediaAttachmentService";

export const useMediaAttachmentMutations = () => {
  const queryClient = useQueryClient();

  const remove = useMutation({
    mutationFn: deleteMediaAttachment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notesV2"] });
      queryClient.invalidateQueries({ queryKey: ["note"] });
    },
  });

  return {
    deleteMediaAttachment: remove.mutateAsync,
    isDeleting: remove.isPending,
  };
};

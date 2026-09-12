import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createTag, getTags } from "../services/tagService";

export const useTags = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["noteTags"],
    queryFn: getTags,
  });
  return { tags: data ?? [], isLoading, isError, refetch };
};

export const useTagMutations = () => {
  const queryClient = useQueryClient();
  const create = useMutation({
    mutationFn: createTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["noteTags"] });
      queryClient.invalidateQueries({ queryKey: ["notesV2"] });
    },
  });
  return { createTag: create.mutateAsync, isCreating: create.isPending };
};

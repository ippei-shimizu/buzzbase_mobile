import type { ReflectionTemplateInput } from "../types/reflectionTemplate";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createReflectionTemplate,
  deleteReflectionTemplate,
  getReflectionTemplates,
  updateReflectionTemplate,
} from "../services/reflectionTemplateService";

export const useReflectionTemplates = () => {
  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ["reflectionTemplates"],
    queryFn: getReflectionTemplates,
  });
  return {
    templates: data ?? [],
    isLoading,
    isError,
    refetch,
    isRefreshing: isRefetching,
  };
};

export const useReflectionTemplateMutations = () => {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["reflectionTemplates"] });

  const create = useMutation({
    mutationFn: createReflectionTemplate,
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number;
      input: ReflectionTemplateInput;
    }) => updateReflectionTemplate(id, input),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: deleteReflectionTemplate,
    onSuccess: invalidate,
  });

  return {
    createTemplate: create.mutateAsync,
    isCreating: create.isPending,
    updateTemplate: update.mutateAsync,
    isUpdating: update.isPending,
    deleteTemplate: remove.mutateAsync,
    isDeleting: remove.isPending,
  };
};

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUserProfile } from "../services/profileService";

export const useProfileEdit = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  return {
    updateProfile: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
};

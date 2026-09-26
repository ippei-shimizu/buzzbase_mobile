import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trackProfileUpdated } from "@utils/analytics";
import { updateUserProfile } from "../services/profileService";

export const useProfileEdit = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: () => {
      trackProfileUpdated();
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      // ["teams"] はチーム名検索のキャッシュ、["teamName"] は id からの名前解決、
      // ["myTeam"] はプロフィール上部の所属チーム表示と、それぞれ別キー。
      queryClient.invalidateQueries({ queryKey: ["teamName"] });
      queryClient.invalidateQueries({ queryKey: ["myTeam"] });
      queryClient.invalidateQueries({ queryKey: ["awards"] });
    },
  });

  return {
    updateProfile: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
};

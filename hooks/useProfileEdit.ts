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
      // ["teams"] はピッカー用のマスタ一覧。プロフィール上部の所属チーム表示は
      // 別キー ["myTeam"] で保持しているため個別に無効化する。
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

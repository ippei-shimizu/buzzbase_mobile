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
      // 保存時にチーム名を更新しうるため、投手一覧などが id から解決したチーム名も取り直す。
      queryClient.invalidateQueries({ queryKey: ["teamName"] });
      // ["teams"] はピッカー用のマスタ一覧で、プロフィール上部の所属チーム表示とは別キー。
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

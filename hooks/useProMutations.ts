import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cancelWebSubscription } from "@services/proService";

/** Web(Stripe)加入者向けの解約申請。成功後は Pro 状態を再取得する。 */
export const useCancelWebSubscription = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: cancelWebSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pro", "status"] });
    },
  });

  return {
    cancelWebSubscription: mutation.mutateAsync,
    isCancelling: mutation.isPending,
  };
};

import { useQuery } from "@tanstack/react-query";
import { fetchProStatus } from "@services/proService";
import { DEFAULT_PRO_STATUS, type ProStatus } from "../types/pro";

/**
 * 現ユーザーの Pro 加入状態を取得するフック。
 * API 失敗時・未認証時は DEFAULT_PRO_STATUS（無料状態）を返す。
 */
export const useProStatus = () => {
  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ["pro", "status"],
    queryFn: fetchProStatus,
  });

  const proStatus: ProStatus = data ?? DEFAULT_PRO_STATUS;
  // サーバー側で「期限内かつ Pro 扱いの status」を判定済みのフラグを単一の真実とする。
  // 期限切れの cancelled / billing_issue で誤って true にならないようにするため。
  const isPro = proStatus.subscription.pro_active;

  return {
    proStatus,
    isPro,
    isLoading,
    isError,
    error,
    refetch,
    isRefreshing: isRefetching,
  };
};

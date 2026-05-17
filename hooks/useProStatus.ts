import { useQuery } from "@tanstack/react-query";
import { fetchProStatus } from "@services/proService";
import { DEFAULT_PRO_STATUS, type ProStatus } from "../types/pro";

const PRO_ACTIVE_STATUSES: ProStatus["subscription"]["status"][] = [
  "trial",
  "active",
  "cancelled",
  "billing_issue",
];

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
  const isPro = PRO_ACTIVE_STATUSES.includes(proStatus.subscription.status);

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

import { useQuery } from "@tanstack/react-query";
import { fetchProStatus } from "@services/proService";
import { DEFAULT_PRO_STATUS, type ProStatus } from "../types/pro";

// Pro 状態は変化頻度が低い（加入・解約・期限切れの数日〜数ヶ月周期）。
// フォーカス復帰や画面遷移のたびに /pro/status を叩かないよう 5 分は stale 扱いにする。
const PRO_STATUS_STALE_TIME_MS = 5 * 60 * 1000;

interface UseProStatusOptions {
  /**
   * false の場合は /pro/status を叩かない。
   * pro_features kill switch が off のときに無駄な API 呼び出しを避ける用途。
   * 既定: true（後方互換）。
   */
  enabled?: boolean;
}

/**
 * 現ユーザーの Pro 加入状態を取得するフック。
 * API 失敗時・未認証時は DEFAULT_PRO_STATUS（無料状態）を返す。
 */
export const useProStatus = ({ enabled = true }: UseProStatusOptions = {}) => {
  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ["pro", "status"],
    queryFn: fetchProStatus,
    staleTime: PRO_STATUS_STALE_TIME_MS,
    enabled,
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

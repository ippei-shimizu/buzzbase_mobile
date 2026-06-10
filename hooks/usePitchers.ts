import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createPitcher, getPitchers } from "@services/pitcherService";

interface UsePitchersParams {
  q?: string;
  teamId?: number | null;
}

/**
 * 相手投手マスタの一覧を取得する。
 * サーバ側で current_user 作成分のみ返却されるため、フロントは追加の絞り込み不要。
 */
export const usePitchers = (params?: UsePitchersParams) => {
  const queryParams = params
    ? { q: params.q, team_id: params.teamId ?? undefined }
    : undefined;
  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ["pitchers", queryParams],
    queryFn: () => getPitchers(queryParams),
  });

  return {
    pitchers: data?.data ?? [],
    pagination: data?.pagination,
    isLoading,
    isError,
    error,
    refetch,
    isRefreshing: isRefetching,
  };
};

/**
 * 新規投手の追加。成功時に `pitchers` query を invalidate して一覧を再取得する。
 */
export const useCreatePitcher = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: createPitcher,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pitchers"] });
    },
  });
  return {
    createPitcher: mutation.mutateAsync,
    isCreating: mutation.isPending,
  };
};

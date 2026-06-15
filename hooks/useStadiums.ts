import type { CreateStadiumPayload } from "../types/stadium";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createStadium, searchStadiums } from "@services/stadiumService";

/**
 * 球場マスタの検索フック。
 *
 * @param q 球場名の部分一致検索（空文字なら全件取得）
 * @param prefectureId 都道府県絞り込み
 */
export const useStadiumSearch = (q: string, prefectureId?: number) => {
  const params: { q?: string; prefecture_id?: number } = {};
  if (q.trim()) {
    params.q = q.trim();
  }
  if (prefectureId !== undefined) {
    params.prefecture_id = prefectureId;
  }

  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: [
      "stadiums",
      { q: params.q ?? "", prefectureId: prefectureId ?? null },
    ],
    queryFn: () => searchStadiums(params),
    // 入力前に全件取得 API を叩かないよう、検索語があるときだけ発火させる。
    enabled: !!params.q,
  });

  return {
    stadiums: data?.data ?? [],
    pagination: data?.pagination,
    isLoading,
    isError,
    error,
    refetch,
    isRefreshing: isRefetching,
  };
};

/**
 * 球場マスタ追加用のミューテーションフック。
 * 成功時に stadiums の queryCache を invalidate する。
 */
export const useCreateStadium = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (payload: CreateStadiumPayload) => createStadium(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stadiums"] });
    },
  });
  return {
    createStadium: mutation.mutateAsync,
    isCreating: mutation.isPending,
    error: mutation.error,
  };
};

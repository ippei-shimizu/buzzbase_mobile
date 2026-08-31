import type {
  PlateAppearanceListResponse,
  PlateAppearanceV2,
  PlateAppearanceV2Payload,
} from "../types/plateAppearance";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPlateAppearanceV2,
  deletePlateAppearanceV2,
  getPlateAppearanceV2,
  getPlateAppearancesByGame,
  updatePlateAppearanceV2,
} from "@services/plateAppearanceV2Service";
import { invalidateGameResultRelated } from "@utils/queryInvalidation";

/**
 * 試合単位で v2 打席リストを取得する。
 *
 * @param gameResultId 取得対象の game_result_id（null/undefined のときは fetch を発火させない）
 */
export const usePlateAppearancesByGame = (gameResultId: number | null) => {
  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ["plateAppearancesV2", gameResultId],
    queryFn: () => getPlateAppearancesByGame(gameResultId as number),
    enabled: gameResultId !== null,
  });

  return {
    plateAppearances: data?.plate_appearances ?? [],
    isLoading,
    isError,
    error,
    refetch,
    isRefreshing: isRefetching,
  };
};

/**
 * 打席 1 件を取得する（打席詳細画面用）。
 *
 * @param id 対象 plate_appearance.id（null のときは fetch を発火させない）
 * @param gameResultId 既知なら list キャッシュ ["plateAppearancesV2", gameResultId]
 *   から initialData を引いて即描画する（不明時は undefined でよい）
 */
export const usePlateAppearance = (
  id: number | null,
  gameResultId?: number,
  viewerUserId?: number | null,
) => {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ["plateAppearanceV2", id],
    queryFn: () => getPlateAppearanceV2(id as number),
    enabled: id !== null,
    // 閲覧可否がフォロー関係に依存するため、既定の 5 分キャッシュに載せず
    // 画面を開くたびにサーバーの認可判定を取り直す。
    staleTime: 0,
    initialData: () => {
      if (id === null || gameResultId === undefined) return undefined;
      const list = queryClient.getQueryData<PlateAppearanceListResponse>([
        "plateAppearancesV2",
        gameResultId,
      ]);
      const cached = list?.plate_appearances.find((pa) => pa.id === id);
      // 他ユーザーの打席は相互フォロー判定をサーバーに委ねる必要がある。
      // initialData を返すと staleTime の間 queryFn が走らず、403 を受け取れない。
      if (!cached || cached.user_id !== viewerUserId) return undefined;
      return cached;
    },
  });

  return {
    plateAppearance: data as PlateAppearanceV2 | undefined,
    isLoading,
    isError,
    error,
    refetch,
    isRefreshing: isRefetching,
  };
};

/**
 * v2 打席作成ミューテーション。
 * 成功時に対象試合の打席キャッシュと、集計が走るダッシュボード／試合一覧を invalidate する。
 */
export const useCreatePlateAppearance = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (payload: PlateAppearanceV2Payload) =>
      createPlateAppearanceV2(payload),
    onSuccess: (created) => {
      queryClient.invalidateQueries({
        queryKey: ["plateAppearancesV2", created.game_result_id],
      });
      invalidateGameResultRelated(queryClient);
    },
  });
  return {
    createPlateAppearance: mutation.mutateAsync,
    isCreating: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
};

/**
 * v2 打席更新ミューテーション。
 */
export const useUpdatePlateAppearance = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: PlateAppearanceV2Payload;
    }) => updatePlateAppearanceV2(id, payload),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({
        queryKey: ["plateAppearancesV2", updated.game_result_id],
      });
      // 漏れると編集後に打席詳細画面が古いまま残る。
      queryClient.invalidateQueries({
        queryKey: ["plateAppearanceV2", updated.id],
      });
      invalidateGameResultRelated(queryClient);
    },
  });
  return {
    updatePlateAppearance: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
};

/**
 * v2 打席削除ミューテーション。
 * 削除自体は game_result_id を持たないため、invalidate 対象を引数で受ける。
 */
export const useDeletePlateAppearance = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ id }: { id: number; gameResultId: number }) =>
      deletePlateAppearanceV2(id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["plateAppearancesV2", variables.gameResultId],
      });
      queryClient.invalidateQueries({
        queryKey: ["plateAppearanceV2", variables.id],
      });
      invalidateGameResultRelated(queryClient);
    },
  });
  return {
    deletePlateAppearance: mutation.mutateAsync,
    isDeleting: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
};

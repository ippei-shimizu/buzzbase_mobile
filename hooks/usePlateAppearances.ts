import type { PlateAppearanceV2Payload } from "../types/plateAppearance";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPlateAppearanceV2,
  deletePlateAppearanceV2,
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

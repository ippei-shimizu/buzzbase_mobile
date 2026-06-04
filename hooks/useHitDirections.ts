import { useQuery } from "@tanstack/react-query";
import { getHitDirections } from "@services/hitDirectionService";

/** zone_polygon を含む打球方向マスタはほぼ変化しないため、24 時間キャッシュする。 */
const HIT_DIRECTIONS_STALE_TIME = 24 * 60 * 60 * 1000;

/**
 * 打球方向マスタを取得する。
 * グラウンドタップ時の `detectZone()` 判定に使う zone_polygon が含まれる。
 */
export const useHitDirections = () => {
  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ["hitDirections"],
    queryFn: getHitDirections,
    staleTime: HIT_DIRECTIONS_STALE_TIME,
  });

  return {
    hitDirections: data?.hit_directions ?? [],
    isLoading,
    isError,
    error,
    refetch,
    isRefreshing: isRefetching,
  };
};

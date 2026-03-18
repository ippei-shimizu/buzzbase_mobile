import { useInfiniteQuery } from "@tanstack/react-query";
import {
  getGameResults,
  getUserGameResults,
} from "../services/gameResultService";
import type { GameResult } from "../types/gameResult";

/** ページネーションキャッシュ混在時の重複排除 */
const dedupGameResults = (results: GameResult[]): GameResult[] => {
  const seen = new Set<number>();
  return results.filter((r) => {
    if (seen.has(r.game_result_id)) return false;
    seen.add(r.game_result_id);
    return true;
  });
};

export const useUserGameResults = (userId: number | undefined) => {
  const { data, isLoading, isRefetching, refetch } = useInfiniteQuery({
    queryKey: ["userGameResults", userId],
    queryFn: ({ pageParam }) => getUserGameResults(userId!, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { current_page, total_pages } = lastPage.pagination;
      return current_page < total_pages ? current_page + 1 : undefined;
    },
    enabled: !!userId,
  });

  const gameResults = dedupGameResults(
    data?.pages.flatMap((page) => page.data) ?? [],
  );

  return {
    gameResults,
    isLoading,
    isRefreshing: isRefetching,
    refetch,
  };
};

export const useGameResults = () => {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["gameResults"],
    queryFn: ({ pageParam }) => getGameResults(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { current_page, total_pages } = lastPage.pagination;
      return current_page < total_pages ? current_page + 1 : undefined;
    },
  });

  const gameResults = dedupGameResults(
    data?.pages.flatMap((page) => page.data) ?? [],
  );

  return {
    gameResults,
    isLoading,
    isError,
    error,
    refetch,
    isRefreshing: isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
};

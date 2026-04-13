import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  getGameResults,
  getUserGameResults,
  getFilteredGameResults,
  getFilteredUserGameResults,
} from "../services/gameResultService";
import type { GameResultFilterParams } from "../services/gameResultService";
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

export const useFilteredGameResults = (params: GameResultFilterParams) => {
  const { data, isLoading, isError, error, refetch, isRefetching, isFetching } =
    useQuery({
      queryKey: ["filteredGameResults", params],
      queryFn: () => getFilteredGameResults(params),
      placeholderData: (prev) => prev,
    });

  return {
    gameResults: data?.data ?? [],
    pagination: data?.pagination ?? null,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    isRefreshing: isRefetching,
  };
};

export const useFilteredUserGameResults = (
  userId: number | undefined,
  params: GameResultFilterParams,
) => {
  const { data, isLoading, isError, error, refetch, isRefetching, isFetching } =
    useQuery({
      queryKey: ["filteredUserGameResults", userId, params],
      queryFn: () => getFilteredUserGameResults(userId!, params),
      placeholderData: (prev) => prev,
      enabled: !!userId,
    });

  return {
    gameResults: data?.data ?? [],
    pagination: data?.pagination ?? null,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    isRefreshing: isRefetching,
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

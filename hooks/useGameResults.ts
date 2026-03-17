import { useInfiniteQuery } from "@tanstack/react-query";
import {
  getGameResults,
  getUserGameResults,
} from "../services/gameResultService";

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

  return {
    gameResults: data?.pages.flatMap((page) => page.data) ?? [],
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

  const gameResults = data?.pages.flatMap((page) => page.data) ?? [];

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

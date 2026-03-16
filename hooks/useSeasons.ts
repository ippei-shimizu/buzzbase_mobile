import { useQuery } from "@tanstack/react-query";
import { getSeasons } from "../services/seasonService";

export const useSeasons = (userId?: number) => {
  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ["seasons", userId],
    queryFn: () => getSeasons(userId),
    enabled: userId !== undefined,
  });

  return {
    seasons: data ?? [],
    isLoading,
    isError,
    error,
    refetch,
    isRefreshing: isRefetching,
  };
};

export const useMySeasons = () => {
  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ["seasons"],
    queryFn: () => getSeasons(),
  });

  return {
    seasons: data ?? [],
    isLoading,
    isError,
    error,
    refetch,
    isRefreshing: isRefetching,
  };
};

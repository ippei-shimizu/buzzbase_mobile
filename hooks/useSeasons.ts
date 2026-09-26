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

export const useMySeasons = ({
  enabled = true,
}: { enabled?: boolean } = {}) => {
  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ["seasons"],
    queryFn: () => getSeasons(),
    enabled,
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

import { useQuery } from "@tanstack/react-query";
import { getCurrentUserProfile } from "../services/profileService";

export const useProfile = () => {
  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ["profile"],
    queryFn: getCurrentUserProfile,
  });

  return {
    profile: data,
    isLoading,
    isError,
    error,
    refetch,
    // 初回ロード中の isRefetching は RefreshControl と二重表示になるため抑制する（issue #341）
    isRefreshing: isRefetching && !isLoading,
  };
};

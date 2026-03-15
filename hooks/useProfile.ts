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
    isRefreshing: isRefetching,
  };
};

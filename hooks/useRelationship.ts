import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserProfileDetail } from "../services/profileService";
import {
  followUser,
  unfollowUser,
  getFollowersUsers,
} from "../services/relationshipService";

export const useUserProfileDetail = (userId: string | undefined) => {
  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ["userProfile", userId],
    queryFn: () => getUserProfileDetail(userId!),
    enabled: !!userId,
  });

  return {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isRefreshing: isRefetching,
  };
};

export const useFollowersUsers = (userId: number | undefined) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["followersUsers", userId],
    queryFn: () => getFollowersUsers(userId!),
    enabled: !!userId,
  });

  return {
    users: data ?? [],
    isLoading,
    isError,
    error,
  };
};

export const useFollowUser = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: followUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      queryClient.invalidateQueries({ queryKey: ["followingUsers"] });
      queryClient.invalidateQueries({ queryKey: ["followersUsers"] });
    },
  });

  return {
    followUser: mutation.mutateAsync,
    isFollowing: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
};

export const useUnfollowUser = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: unfollowUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      queryClient.invalidateQueries({ queryKey: ["followingUsers"] });
      queryClient.invalidateQueries({ queryKey: ["followersUsers"] });
    },
  });

  return {
    unfollowUser: mutation.mutateAsync,
    isUnfollowing: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
};

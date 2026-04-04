import { useQuery } from "@tanstack/react-query";
import {
  getGroups,
  getGroupDetail,
  getGroupMembers,
  getFollowingUsers,
} from "../services/groupService";

export const useGroups = () => {
  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ["groups"],
    queryFn: getGroups,
  });

  return {
    groups: data ?? [],
    isLoading,
    isError,
    error,
    refetch,
    isRefreshing: isRefetching,
  };
};

export const useGroupDetail = (
  id: number | undefined,
  year?: string,
  matchType?: string,
) => {
  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ["group", id, year, matchType],
    queryFn: () => getGroupDetail(id!, year, matchType),
    enabled: !!id,
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

export const useGroupMembers = (id: number | undefined) => {
  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ["groupMembers", id],
    queryFn: () => getGroupMembers(id!),
    enabled: !!id,
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

export const useFollowingUsers = (userId: number | undefined) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["followingUsers", userId],
    queryFn: () => getFollowingUsers(userId!),
    enabled: !!userId,
  });

  return {
    users: data ?? [],
    isLoading,
    isError,
    error,
  };
};

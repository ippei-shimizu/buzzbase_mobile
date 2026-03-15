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

export const useGroupDetail = (id: number | undefined) => {
  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ["group", id],
    queryFn: () => getGroupDetail(id!),
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

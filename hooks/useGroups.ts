import { useQuery } from "@tanstack/react-query";
import {
  getGroups,
  getGroupDetail,
  getGroupMembers,
  getFollowingUsers,
} from "../services/groupService";

export const useGroups = (options?: { enabled?: boolean }) => {
  const { data, isLoading, isError, error, refetch, isRefetching, isFetched } =
    useQuery({
      queryKey: ["groups"],
      queryFn: getGroups,
      enabled: options?.enabled ?? true,
    });

  return {
    groups: data ?? [],
    isLoading,
    isError,
    error,
    refetch,
    isRefreshing: isRefetching,
    // 取得確定前（enabled が true になった直後のフェッチ開始前）を区別するために露出する
    isFetched,
  };
};

export const useGroupDetail = (
  id: number | undefined,
  year?: string,
  matchType?: string,
  tournamentId?: string,
) => {
  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ["group", id, year, matchType, tournamentId],
    queryFn: () => getGroupDetail(id!, year, matchType, tournamentId),
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

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getManagementNotices,
  getManagementNotice,
  getNotificationCount,
  markManagementNoticesRead,
} from "../services/notificationService";

export const useManagementNotices = () => {
  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ["managementNotices"],
    queryFn: getManagementNotices,
  });

  return {
    notices: data ?? [],
    isLoading,
    isError,
    error,
    refetch,
    isRefreshing: isRefetching,
  };
};

export const useManagementNotice = (id: number | undefined) => {
  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ["managementNotice", id],
    queryFn: () => getManagementNotice(id!),
    enabled: !!id,
  });

  return {
    notice: data,
    isLoading,
    isError,
    error,
    refetch,
    isRefreshing: isRefetching,
  };
};

export const useNotificationCount = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["notificationCount"],
    queryFn: getNotificationCount,
    refetchInterval: 60000,
  });

  return {
    count: data?.count ?? 0,
    isLoading,
  };
};

export const useMarkNoticesRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markManagementNoticesRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notificationCount"] });
    },
  });
};

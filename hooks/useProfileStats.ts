import type { StatsFilters } from "../types/profile";
import { useQuery } from "@tanstack/react-query";
import {
  getProfileBattingStats,
  getProfilePitchingStats,
  getUserBattingStats,
  getUserPitchingStats,
} from "../services/profileService";

export const useUserStats = (
  userId: number | undefined,
  filters: StatsFilters,
) => {
  const batting = useQuery({
    queryKey: ["userBattingStats", userId, filters],
    queryFn: () => getUserBattingStats(userId!, filters),
    enabled: !!userId,
  });

  const pitching = useQuery({
    queryKey: ["userPitchingStats", userId, filters],
    queryFn: () => getUserPitchingStats(userId!, filters),
    enabled: !!userId,
  });

  return {
    battingStats: batting.data,
    pitchingStats: pitching.data,
    isLoading: batting.isLoading || pitching.isLoading,
    isError: batting.isError || pitching.isError,
    refetch: () => {
      batting.refetch();
      pitching.refetch();
    },
    // 初回ロードは ActivityIndicator 側に任せ、RefreshControl との二重表示を避ける
    isRefreshing:
      (batting.isRefetching || pitching.isRefetching) &&
      !(batting.isLoading || pitching.isLoading),
  };
};

export const useProfileStats = (filters: StatsFilters) => {
  const batting = useQuery({
    queryKey: ["profileBattingStats", filters],
    queryFn: () => getProfileBattingStats(filters),
  });

  const pitching = useQuery({
    queryKey: ["profilePitchingStats", filters],
    queryFn: () => getProfilePitchingStats(filters),
  });

  return {
    battingStats: batting.data,
    pitchingStats: pitching.data,
    isLoading: batting.isLoading || pitching.isLoading,
    isError: batting.isError || pitching.isError,
    refetch: () => {
      batting.refetch();
      pitching.refetch();
    },
    // 初回ロードは ActivityIndicator 側に任せ、RefreshControl との二重表示を避ける
    isRefreshing:
      (batting.isRefetching || pitching.isRefetching) &&
      !(batting.isLoading || pitching.isLoading),
  };
};

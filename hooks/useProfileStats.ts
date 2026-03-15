import { useQuery } from "@tanstack/react-query";
import {
  getProfileBattingStats,
  getProfilePitchingStats,
} from "../services/profileService";
import type { StatsFilters } from "../types/profile";

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
    isRefreshing: batting.isRefetching || pitching.isRefetching,
  };
};

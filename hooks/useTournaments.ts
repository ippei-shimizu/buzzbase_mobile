import { useQuery } from "@tanstack/react-query";
import { getUserTournaments } from "@services/gameRecordService";

export const useTournaments = (userId?: number) => {
  const { data, isLoading } = useQuery({
    queryKey: ["userTournaments", userId],
    queryFn: () => getUserTournaments(userId),
  });

  return {
    tournaments: data ?? [],
    isLoading,
  };
};

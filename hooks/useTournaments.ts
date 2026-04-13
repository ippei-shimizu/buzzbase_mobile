import { useQuery } from "@tanstack/react-query";
import { getTournaments } from "../services/gameRecordService";

export const useTournaments = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["tournaments"],
    queryFn: getTournaments,
  });

  return {
    tournaments: data ?? [],
    isLoading,
  };
};

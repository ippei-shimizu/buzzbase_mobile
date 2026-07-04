import { useQuery } from "@tanstack/react-query";
import { getAvailableMonths } from "@services/matchResultService";

export const useAvailableMonths = (userId?: number) => {
  const { data, isLoading } = useQuery({
    queryKey: ["availableMonths", userId],
    queryFn: () => getAvailableMonths(userId),
  });

  return {
    months: data ?? [],
    isLoading,
  };
};

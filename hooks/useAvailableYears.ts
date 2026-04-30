import { useQuery } from "@tanstack/react-query";
import { getAvailableYears } from "@services/matchResultService";

export const useAvailableYears = (userId?: number) => {
  const { data, isLoading } = useQuery({
    queryKey: ["availableYears", userId],
    queryFn: () => getAvailableYears(userId),
  });

  return {
    years: data ?? [],
    isLoading,
  };
};

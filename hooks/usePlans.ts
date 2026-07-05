import { useQuery } from "@tanstack/react-query";
import { getCalendar, getDayPlan } from "../services/planService";

/** 指定日の予定（今日のやること）。date は "YYYY-MM-DD"。 */
export const useDayPlan = (date: string) => {
  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ["plans", "by_date", date],
    queryFn: () => getDayPlan(date),
  });
  return {
    plans: data ?? [],
    isLoading,
    isError,
    refetch,
    isRefreshing: isRefetching,
  };
};

/** 期間内のカレンダーエントリ。from/to は "YYYY-MM-DD"。 */
export const useCalendar = (from: string, to: string) => {
  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ["plans", "calendar", from, to],
    queryFn: () => getCalendar(from, to),
  });
  return {
    entries: data?.entries ?? [],
    isLoading,
    isError,
    refetch,
    isRefreshing: isRefetching,
  };
};

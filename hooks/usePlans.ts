import type { Plan } from "../types/plan";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCalendar, getDayPlan } from "../services/planService";
import {
  createPracticeLog,
  deletePracticeLog,
  getPracticeLogs,
} from "../services/practiceLogService";

/** 指定日の予定（今日のやること）。date は "YYYY-MM-DD"。null なら取得しない。 */
export const useDayPlan = (date: string | null) => {
  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ["plans", "by_date", date],
    queryFn: () => getDayPlan(date as string),
    enabled: date != null,
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

/** 予定（schedule）× メニューを一意に指す複合キー。同一メニューが複数予定にある場合の識別に使う。 */
export const dayPlanMenuKey = (scheduleId: number, practiceMenuId: number) =>
  `${scheduleId}:${practiceMenuId}`;

/** 対象メニューの done を反転させた plans を返す。予定全体の done も再計算する。 */
const toggleMenuInPlans = (
  plans: Plan[] | undefined,
  scheduleId: number,
  practiceMenuId: number,
): Plan[] | undefined =>
  plans?.map((plan) => {
    if (plan.id !== scheduleId) return plan;
    const menus = plan.menus.map((menu) =>
      menu.practice_menu_id === practiceMenuId
        ? { ...menu, done: !menu.done }
        : menu,
    );
    return {
      ...plan,
      menus,
      done: menus.length > 0 && menus.every((menu) => menu.done),
    };
  });

/**
 * 「今日のやること」メニューの done を練習ログの作成/削除でトグルする。
 * done=false のメニューは量なしログを 1 件作成し、done=true のメニューは
 * その予定に紐づく当日ログを削除して未完了に戻す。done は予定（schedule）単位で
 * 管理するため、同じメニューが複数の予定にあっても独立してトグルする。date は "YYYY-MM-DD"。
 * 再取得を待つ間のチラつきを避けるため、キャッシュを楽観的に反転し失敗時のみ巻き戻す。
 */
export const useToggleDayPlanMenu = (date: string) => {
  const queryClient = useQueryClient();
  const plansQueryKey = ["plans", "by_date", date];
  // ログの増減は予定の done・当日の活動集計（草・Streak）・セッションに波及する。
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["plans"] });
    queryClient.invalidateQueries({ queryKey: ["practiceLogs"] });
    queryClient.invalidateQueries({ queryKey: ["practiceSessions"] });
    queryClient.invalidateQueries({ queryKey: ["practiceSession"] });
    queryClient.invalidateQueries({ queryKey: ["activityLogs"] });
    queryClient.invalidateQueries({ queryKey: ["streak"] });
  };

  const mutation = useMutation({
    mutationFn: async ({
      scheduleId,
      practiceMenuId,
      done,
    }: {
      scheduleId: number;
      practiceMenuId: number;
      done: boolean;
    }) => {
      if (done) {
        const logs = await getPracticeLogs({ from: date, to: date });
        const targets = logs.filter(
          (log) =>
            log.practice_menu_id === practiceMenuId &&
            log.schedule_id === scheduleId,
        );
        await Promise.all(targets.map((log) => deletePracticeLog(log.id)));
      } else {
        await createPracticeLog({
          practice_menu_id: practiceMenuId,
          schedule_id: scheduleId,
          logged_on: date,
        });
      }
    },
    onMutate: async ({ scheduleId, practiceMenuId }) => {
      await queryClient.cancelQueries({ queryKey: plansQueryKey });
      const previousPlans = queryClient.getQueryData<Plan[]>(plansQueryKey);
      queryClient.setQueryData<Plan[]>(plansQueryKey, (plans) =>
        toggleMenuInPlans(plans, scheduleId, practiceMenuId),
      );
      return { previousPlans };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousPlans) {
        queryClient.setQueryData(plansQueryKey, context.previousPlans);
      }
    },
    onSettled: invalidate,
  });

  const pending = mutation.isPending ? mutation.variables : null;

  return {
    toggleMenu: mutation.mutateAsync,
    togglingMenuKey: pending
      ? dayPlanMenuKey(pending.scheduleId, pending.practiceMenuId)
      : null,
  };
};

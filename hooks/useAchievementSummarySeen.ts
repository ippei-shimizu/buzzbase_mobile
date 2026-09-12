import * as SecureStore from "expo-secure-store";
import { useCallback } from "react";

const LAST_SHOWN_PERIOD_KEY = "achievement_summary_last_shown_period";

/** 達成サマリーモーダルを「その月はもう見せたか」の端末内フラグ管理。 */
export const useAchievementSummarySeen = () => {
  const getLastShownPeriod = useCallback(
    (): Promise<string | null> =>
      SecureStore.getItemAsync(LAST_SHOWN_PERIOD_KEY),
    [],
  );

  const markPeriodShown = useCallback(
    (period: string): Promise<void> =>
      SecureStore.setItemAsync(LAST_SHOWN_PERIOD_KEY, period),
    [],
  );

  return { getLastShownPeriod, markPeriodShown };
};

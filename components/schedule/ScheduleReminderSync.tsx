import Constants from "expo-constants";
import { useEffect } from "react";
import { useSchedules } from "@hooks/useSchedules";
import { syncScheduleReminders } from "@services/scheduleReminderService";

const isExpoGo = Constants.appOwnership === "expo";

/**
 * スケジュールの変更(作成/更新/削除/入退場)を端末のローカル通知へ反映する。
 * ログイン中は常時マウントされ、useSchedulesのキャッシュがどの画面で
 * 無効化されても再同期される(特定画面を開いた時だけ同期される問題を解消)。
 */
export function ScheduleReminderSync() {
  const { schedules } = useSchedules();

  useEffect(() => {
    if (isExpoGo) return;
    void syncScheduleReminders(schedules);
  }, [schedules]);

  return null;
}

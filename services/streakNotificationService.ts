import * as Notifications from "expo-notifications";

const REMINDER_ID = "streak-reminder";

/**
 * Streak 保持中で当日未活動のとき、夜（20時）に「今日まだ草が生えていません」を
 * ローカル通知する。サーバー push は使わず端末内で完結する。
 */
export const scheduleStreakReminder = async (): Promise<void> => {
  await cancelStreakReminder();
  await Notifications.scheduleNotificationAsync({
    identifier: REMINDER_ID,
    content: {
      title: "BUZZ BASE",
      body: "今日まだ草が生えていません。練習を記録しましょう",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 20,
      minute: 0,
    },
  });
};

export const cancelStreakReminder = async (): Promise<void> => {
  try {
    await Notifications.cancelScheduledNotificationAsync(REMINDER_ID);
  } catch {
    // 未登録なら無視する。
  }
};

import type { Schedule } from "../types/schedule";
import * as Notifications from "expo-notifications";

const PREFIX = "schedule-";

// 我々の曜日（月=1〜日=7）→ expo の weekday（日=1〜土=7）。
const toExpoWeekday = (day: number): number => (day === 7 ? 1 : day + 1);

/**
 * サーバーのスケジュールから端末のローカル通知（曜日×時刻の WEEKLY）を再構成する。
 * 既存の schedule- 系通知を一旦解除してから貼り直す（保存/削除/無効化に追従）。
 */
export const syncScheduleReminders = async (
  schedules: Schedule[],
): Promise<void> => {
  const existing = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    existing
      .filter((item) => item.identifier.startsWith(PREFIX))
      .map((item) =>
        Notifications.cancelScheduledNotificationAsync(item.identifier).catch(
          () => undefined,
        ),
      ),
  );

  for (const schedule of schedules) {
    if (!schedule.active || !schedule.notification_enabled) continue;
    const [hour, minute] = schedule.scheduled_time.split(":").map(Number);
    const body = schedule.notification_message || `${schedule.title}の時間です`;
    for (const day of schedule.days_of_week.split(",").map(Number)) {
      await Notifications.scheduleNotificationAsync({
        identifier: `${PREFIX}${schedule.id}-${day}`,
        content: { title: "BUZZ BASE", body },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: toExpoWeekday(day),
          hour,
          minute,
        },
      });
    }
  }
};

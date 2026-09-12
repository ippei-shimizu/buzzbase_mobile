import type { Schedule } from "../types/schedule";
import * as Notifications from "expo-notifications";
import { fromIsoDate } from "@utils/planDate";

const PREFIX = "schedule-";

// 我々の曜日（月=1〜日=7）→ expo の weekday（日=1〜土=7）。
const toExpoWeekday = (day: number): number => (day === 7 ? 1 : day + 1);

const reminderBody = (schedule: Schedule): string =>
  schedule.notification_message || `${schedule.title ?? "練習"}の時間です`;

/**
 * サーバーのスケジュールから端末のローカル通知を再構成する。
 * 繰り返し（曜日）は WEEKLY、単発（planned_on）は一度きりの DATE トリガーで貼る。
 * 既存の schedule- 系通知を一旦解除してから貼り直す（保存/削除/無効化に追従）。
 * 時刻未設定（終日）の予定は通知しない。
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
    if (!schedule.scheduled_time) continue;
    const [hour, minute] = schedule.scheduled_time.split(":").map(Number);
    const body = reminderBody(schedule);

    // タップ時にusePushNotificationsが該当スケジュールへ遷移できるよう、
    // 種別とschedule idをdataに乗せておく。
    const notificationData = {
      type: "schedule_reminder",
      scheduleId: schedule.id,
    };

    if (schedule.days_of_week) {
      for (const day of schedule.days_of_week.split(",").map(Number)) {
        await Notifications.scheduleNotificationAsync({
          identifier: `${PREFIX}${schedule.id}-${day}`,
          content: { title: "BUZZ BASE", body, data: notificationData },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
            weekday: toExpoWeekday(day),
            hour,
            minute,
          },
        });
      }
      continue;
    }

    if (schedule.planned_on) {
      const fireAt = fromIsoDate(schedule.planned_on);
      fireAt.setHours(hour, minute, 0, 0);
      // 過去日時は即時発火してしまうため貼らない。
      if (fireAt.getTime() <= Date.now()) continue;
      await Notifications.scheduleNotificationAsync({
        identifier: `${PREFIX}${schedule.id}-once`,
        content: { title: "BUZZ BASE", body, data: notificationData },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: fireAt,
        },
      });
    }
  }
};

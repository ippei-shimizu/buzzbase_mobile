import Constants from "expo-constants";
import { useEffect } from "react";
import {
  cancelStreakReminder,
  scheduleStreakReminder,
} from "../services/streakNotificationService";

const isExpoGo = Constants.appOwnership === "expo";

/**
 * Streak 保持中（current > 0）かつ当日未活動のとき夜のリマインドを予約し、
 * 当日活動済み or streak が無いときは予約を解除する。
 */
export const useStreakReminder = (current: number, todayActive: boolean) => {
  useEffect(() => {
    if (isExpoGo) return;
    if (current > 0 && !todayActive) {
      void scheduleStreakReminder();
    } else {
      void cancelStreakReminder();
    }
  }, [current, todayActive]);
};

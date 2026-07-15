import Constants from "expo-constants";
import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { CalendarView } from "@components/schedule/CalendarView";
import { MenuSetListView } from "@components/schedule/MenuSetListView";
import { WeeklyPlanView } from "@components/schedule/WeeklyPlanView";
import { UnderlineTabBar } from "@components/ui/UnderlineTabBar";
import { useSchedules } from "@hooks/useSchedules";
import { syncScheduleReminders } from "@services/scheduleReminderService";

const isExpoGo = Constants.appOwnership === "expo";
const SEGMENTS = ["練習プランセット", "週の練習プラン", "カレンダー"];

/** 練習プランの入口画面。練習プランセット・週の練習プラン・カレンダーをタブで切り替える。 */
export default function MenuSetListScreen() {
  const [segment, setSegment] = useState(0);
  const { schedules } = useSchedules();

  // 練習プランの入口画面のため、スケジュールが変わるたびに端末のローカル通知を貼り直す。
  useEffect(() => {
    if (isExpoGo) return;
    void syncScheduleReminders(schedules);
  }, [schedules]);

  return (
    <View style={styles.container}>
      <UnderlineTabBar
        options={SEGMENTS}
        selectedIndex={segment}
        onSelect={setSegment}
      />
      {segment === 0 ? (
        <MenuSetListView />
      ) : segment === 1 ? (
        <WeeklyPlanView />
      ) : (
        <CalendarView />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#2E2E2E" },
});

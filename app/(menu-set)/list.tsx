import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { CalendarView } from "@components/schedule/CalendarView";
import { MenuSetListView } from "@components/schedule/MenuSetListView";
import { WeeklyPlanView } from "@components/schedule/WeeklyPlanView";
import { UnderlineTabBar } from "@components/ui/UnderlineTabBar";

const SEGMENTS = ["練習プランセット", "週の練習プラン", "カレンダー"];

/** 練習プランの入口画面。練習プランセット・週の練習プラン・カレンダーをタブで切り替える。 */
export default function MenuSetListScreen() {
  const [segment, setSegment] = useState(0);

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

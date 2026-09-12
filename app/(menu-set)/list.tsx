import React, { useRef, useState } from "react";
import { View, StyleSheet } from "react-native";
import PagerView from "react-native-pager-view";
import { CalendarView } from "@components/schedule/CalendarView";
import { MenuSetListView } from "@components/schedule/MenuSetListView";
import { WeeklyPlanView } from "@components/schedule/WeeklyPlanView";
import { UnderlineTabBar } from "@components/ui/UnderlineTabBar";

const SEGMENTS = ["練習プランセット", "週の練習プラン", "カレンダー"];

/** 練習プランの入口画面。練習プランセット・週の練習プラン・カレンダーをタブと横スワイプで切り替える。 */
export default function MenuSetListScreen() {
  const [segment, setSegment] = useState(0);
  // PagerView は全ページを同時にマウントするため、開いた面だけ中身を描いて
  // 3面分のクエリが一度に走るのを避ける。
  const [visited, setVisited] = useState<number[]>([0]);
  const pagerRef = useRef<PagerView>(null);

  const showPage = (index: number) => {
    // 離れた面へ飛ぶときはアニメーションで通過する面も見えるため、間の面も描く。
    const [from, to] = segment <= index ? [segment, index] : [index, segment];
    setVisited((prev) => {
      const next = new Set(prev);
      for (let page = from; page <= to; page += 1) next.add(page);
      return next.size === prev.length ? prev : [...next];
    });
    setSegment(index);
  };

  const selectSegment = (index: number) => {
    showPage(index);
    pagerRef.current?.setPage(index);
  };

  return (
    <View style={styles.container}>
      <UnderlineTabBar
        options={SEGMENTS}
        selectedIndex={segment}
        onSelect={selectSegment}
      />
      <PagerView
        ref={pagerRef}
        style={styles.pager}
        initialPage={0}
        onPageSelected={(event) => showPage(event.nativeEvent.position)}
      >
        <View key="menu-sets" style={styles.page}>
          {visited.includes(0) ? <MenuSetListView /> : null}
        </View>
        <View key="weekly-plan" style={styles.page}>
          {visited.includes(1) ? <WeeklyPlanView /> : null}
        </View>
        <View key="calendar" style={styles.page}>
          {/* カレンダーの月/週/日は外側のタブ送りと競合するため横スワイプを渡さない。 */}
          {visited.includes(2) ? <CalendarView swipeEnabled={false} /> : null}
        </View>
      </PagerView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#2E2E2E" },
  pager: { flex: 1 },
  page: { flex: 1 },
});

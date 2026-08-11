import { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import PagerView from "react-native-pager-view";

interface SwipeableTabPagesProps<T extends string> {
  /** タブのキー。配列の順序がページの並びになる。 */
  tabKeys: readonly T[];
  activeKey: T;
  onChange: (key: T) => void;
  /** 各ページの中身。開いた面だけ呼ばれる。 */
  renderPage: (key: T) => React.ReactNode;
}

/**
 * タブ本文を横スワイプで送れるページャ。
 *
 * PanResponder ではなくネイティブのページャを使う。JS 側のジェスチャーだと
 * 画面端から始めた横スワイプが iOS の戻る操作と競合し、前の画面へ戻ってしまうため。
 */
export function SwipeableTabPages<T extends string>({
  tabKeys,
  activeKey,
  onChange,
  renderPage,
}: SwipeableTabPagesProps<T>) {
  const pagerRef = useRef<PagerView>(null);
  const [initialIndex] = useState(() =>
    Math.max(tabKeys.indexOf(activeKey), 0),
  );
  // PagerView は全ページを同時にマウントするため、開いた面だけ中身を描く。
  const [visited, setVisited] = useState<number[]>([initialIndex]);
  // ページャが最後に報告した位置。タブタップとスワイプの二重反映を防ぐ。
  const pagerIndexRef = useRef(initialIndex);

  const activeIndex = Math.max(tabKeys.indexOf(activeKey), 0);

  const markVisited = (index: number) => {
    // 離れた面へ飛ぶときはアニメーションで通過する面も見えるため、間の面も描く。
    const from = Math.min(pagerIndexRef.current, index);
    const to = Math.max(pagerIndexRef.current, index);
    setVisited((prev) => {
      const next = new Set(prev);
      for (let page = from; page <= to; page += 1) next.add(page);
      return next.size === prev.length ? prev : [...next];
    });
  };

  // タブをタップして activeKey が変わったときに、ページャ側を追従させる。
  useEffect(() => {
    if (pagerIndexRef.current === activeIndex) return;

    markVisited(activeIndex);
    pagerIndexRef.current = activeIndex;
    pagerRef.current?.setPage(activeIndex);
    // markVisited は描画対象の集合を広げるだけで、activeIndex 以外に依存しない。
  }, [activeIndex]);

  return (
    <PagerView
      ref={pagerRef}
      style={styles.pager}
      initialPage={initialIndex}
      onPageSelected={(event) => {
        const index = event.nativeEvent.position;
        if (index === pagerIndexRef.current) return;

        markVisited(index);
        pagerIndexRef.current = index;
        onChange(tabKeys[index]);
      }}
    >
      {tabKeys.map((key, index) => (
        <View key={key} style={styles.page}>
          {visited.includes(index) ? renderPage(key) : null}
        </View>
      ))}
    </PagerView>
  );
}

const styles = StyleSheet.create({
  pager: { flex: 1 },
  page: { flex: 1 },
});

import { useMemo, useRef } from "react";
import { PanResponder, type PanResponderInstance } from "react-native";

/** これ未満の横移動はタップ・縦スクロールの巻き添えとみなして無視する。 */
const SWIPE_THRESHOLD_PX = 60;

/** 横移動がこの倍率で縦移動を上回るまでは、縦スクロールを妨げない。 */
const HORIZONTAL_DOMINANCE = 1.5;

/**
 * 横スワイプで前後を送るための PanResponder を返す。
 *
 * react-native-gesture-handler を足すとネイティブビルドが必要になるため、
 * ZoomableImage と同じく PanResponder で実装する。
 *
 * @param onSwipe 送る向き。left は次（右から左へ払う操作）、right は前。
 */
export function useHorizontalSwipe(
  onSwipe: (direction: "left" | "right") => void,
): PanResponderInstance {
  // PanResponder は生成時のクロージャを握るため、最新の実装を ref 経由で呼ぶ。
  const onSwipeRef = useRef(onSwipe);
  onSwipeRef.current = onSwipe;

  return useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_event, gesture) =>
          Math.abs(gesture.dx) > SWIPE_THRESHOLD_PX &&
          Math.abs(gesture.dx) > Math.abs(gesture.dy) * HORIZONTAL_DOMINANCE,
        onPanResponderRelease: (_event, gesture) => {
          if (Math.abs(gesture.dx) < SWIPE_THRESHOLD_PX) return;
          onSwipeRef.current(gesture.dx < 0 ? "left" : "right");
        },
      }),
    [],
  );
}

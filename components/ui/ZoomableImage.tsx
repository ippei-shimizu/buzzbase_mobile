import { useRef } from "react";
import {
  Animated,
  Image,
  PanResponder,
  StyleSheet,
  View,
  type ImageResizeMode,
  type StyleProp,
  type ViewStyle,
} from "react-native";

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const DOUBLE_TAP_SCALE = 2;
const DOUBLE_TAP_INTERVAL_MS = 300;

interface Touch {
  pageX: number;
  pageY: number;
}

const touchDistance = (touches: Touch[]): number =>
  Math.hypot(
    touches[0].pageX - touches[1].pageX,
    touches[0].pageY - touches[1].pageY,
  );

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

interface Props {
  uri: string;
  style?: StyleProp<ViewStyle>;
  resizeMode?: ImageResizeMode;
  accessibilityLabel?: string;
}

/**
 * ピンチで拡大・ドラッグで移動できる画像。ダブルタップで等倍⇄2倍を切り替える。
 *
 * react-native-gesture-handler を追加すると native ビルドが必要になるため、
 * RN 標準の PanResponder でマルチタッチ座標から倍率を算出している。
 * 等倍のときは1本指ジェスチャを横取りしないので、親のスクロールを妨げない。
 */
export function ZoomableImage({
  uri,
  style,
  resizeMode = "contain",
  accessibilityLabel,
}: Props) {
  const scale = useRef(new Animated.Value(MIN_SCALE)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  // Animated.Value は同期的に読めないため、ジェスチャ計算用の実値を別途保持する。
  const current = useRef({ scale: MIN_SCALE, x: 0, y: 0 });
  const gestureStart = useRef({ scale: MIN_SCALE, x: 0, y: 0, distance: 0 });
  const lastTapAt = useRef(0);

  const reset = () => {
    current.current = { scale: MIN_SCALE, x: 0, y: 0 };
    Animated.parallel([
      Animated.timing(scale, {
        toValue: MIN_SCALE,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const zoomTo = (value: number) => {
    current.current = { scale: value, x: 0, y: 0 };
    Animated.parallel([
      Animated.timing(scale, {
        toValue: value,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      // 等倍で1本指のときは親（モーダルのScrollView）にジェスチャを譲る。
      onMoveShouldSetPanResponder: (event) =>
        event.nativeEvent.touches.length === 2 ||
        current.current.scale > MIN_SCALE,
      onPanResponderGrant: (event) => {
        const touches = event.nativeEvent.touches;
        gestureStart.current = {
          scale: current.current.scale,
          x: current.current.x,
          y: current.current.y,
          distance: touches.length === 2 ? touchDistance(touches) : 0,
        };

        const now = Date.now();
        if (
          touches.length === 1 &&
          now - lastTapAt.current < DOUBLE_TAP_INTERVAL_MS
        ) {
          lastTapAt.current = 0;
          if (current.current.scale > MIN_SCALE) reset();
          else zoomTo(DOUBLE_TAP_SCALE);
          return;
        }
        lastTapAt.current = now;
      },
      onPanResponderMove: (event, gesture) => {
        const touches = event.nativeEvent.touches;
        if (touches.length === 2) {
          if (gestureStart.current.distance === 0) {
            gestureStart.current.distance = touchDistance(touches);
            return;
          }
          const ratio = touchDistance(touches) / gestureStart.current.distance;
          const next = clamp(
            gestureStart.current.scale * ratio,
            MIN_SCALE,
            MAX_SCALE,
          );
          current.current.scale = next;
          scale.setValue(next);
          return;
        }

        if (current.current.scale <= MIN_SCALE) return;
        current.current.x = gestureStart.current.x + gesture.dx;
        current.current.y = gestureStart.current.y + gesture.dy;
        translateX.setValue(current.current.x);
        translateY.setValue(current.current.y);
      },
      onPanResponderRelease: () => {
        // 縮小して等倍以下に戻したときは、ずらしたままだと画像が画面外に残るため中央へ戻す。
        if (current.current.scale <= MIN_SCALE) reset();
      },
    }),
  ).current;

  return (
    <View style={[styles.container, style]} {...responder.panHandlers}>
      <Animated.View
        style={[
          styles.fill,
          { transform: [{ scale }, { translateX }, { translateY }] },
        ]}
      >
        <Image
          source={{ uri }}
          style={styles.fill}
          resizeMode={resizeMode}
          accessible={accessibilityLabel != null}
          accessibilityLabel={accessibilityLabel}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { overflow: "hidden" },
  fill: { width: "100%", height: "100%" },
});

import type { SnackbarType } from "../../stores/snackbarStore";
import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSnackbarStore } from "../../stores/snackbarStore";

/**
 * Snackbar 単体コンポーネント（通常は SnackbarHost 経由でレンダリングされる）。
 *
 * - 画面上部に表示し、safe-area の top inset を考慮した位置に出る
 * - `visible` が true になったタイミングでスライドイン+フェードイン、
 *   `durationMs` 経過 or タップで自動 hide → スライドアウト+フェードアウト
 * - `nonce` を依存に含めることで「同じメッセージを連続 show」しても再アニメーションする
 */
export function Snackbar() {
  const visible = useSnackbarStore((s) => s.visible);
  const type = useSnackbarStore((s) => s.type);
  const message = useSnackbarStore((s) => s.message);
  const durationMs = useSnackbarStore((s) => s.durationMs);
  const nonce = useSnackbarStore((s) => s.nonce);
  const hide = useSnackbarStore((s) => s.hide);
  const insets = useSafeAreaInsets();

  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    if (!visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 180,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -20,
          duration: 180,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();

    const timerId = setTimeout(() => hide(), durationMs);
    return () => clearTimeout(timerId);
  }, [visible, durationMs, nonce, opacity, translateY, hide]);

  if (!visible && opacityIsZero(opacity)) return null;

  return (
    <Animated.View
      pointerEvents={visible ? "box-none" : "none"}
      accessibilityLiveRegion="polite"
      style={[
        styles.container,
        { top: insets.top + 8, opacity, transform: [{ translateY }] },
      ]}
    >
      <TouchableWithoutFeedback onPress={hide} accessibilityRole="alert">
        <View style={[styles.bar, backgroundForType(type)]}>
          {/* 複数のバリデーションエラーを改行で連結して渡されるケースに合わせて行数を確保する。 */}
          <Text style={styles.message} numberOfLines={8}>
            {message}
          </Text>
        </View>
      </TouchableWithoutFeedback>
    </Animated.View>
  );
}

/** Animated.Value の現在値を 0 と比較する（型上 _value にしかアクセスできないため小ヘルパに切り出す）。 */
function opacityIsZero(value: Animated.Value): boolean {
  // @ts-expect-error _value は public でないが、レンダリング判定用に参照する
  return value._value === 0;
}

function backgroundForType(type: SnackbarType) {
  switch (type) {
    case "error":
      return styles.error;
    case "success":
      return styles.success;
    default:
      return styles.info;
  }
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 1000,
    elevation: 10,
  },
  bar: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  message: {
    color: "#F4F4F4",
    fontSize: 14,
    fontWeight: "600",
  },
  // フィールドエラーのテキストカラー（GameInfoForm の fieldError）と揃え、
  // フォーム内の赤色トーンを統一する。
  error: {
    backgroundColor: "#F31260",
  },
  success: {
    backgroundColor: "#15803D",
  },
  info: {
    backgroundColor: "#404040",
  },
});

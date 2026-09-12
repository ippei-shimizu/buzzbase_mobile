import { useEffect, useRef } from "react";
import { Animated, View, type ViewStyle } from "react-native";

const BASE_COLOR = "#3A3A3A";

interface SkeletonProps {
  width?: ViewStyle["width"];
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

/**
 * 読み込み中のプレースホルダー。
 * ActivityIndicator と違い実レイアウトの形を保つため、描画後に位置が飛ばない。
 */
export function Skeleton({
  width = "100%",
  height = 16,
  borderRadius = 8,
  style,
}: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View
      accessibilityRole="progressbar"
      style={[
        { width, height, borderRadius, backgroundColor: BASE_COLOR, opacity },
        style,
      ]}
    />
  );
}

interface SkeletonListProps {
  count: number;
  itemHeight: number;
  gap?: number;
  borderRadius?: number;
}

/** 同じ高さのカードが縦に並ぶ一覧のプレースホルダー。 */
export function SkeletonList({
  count,
  itemHeight,
  gap = 12,
  borderRadius = 10,
}: SkeletonListProps) {
  return (
    <View style={{ gap }}>
      {Array.from({ length: count }, (_, index) => (
        <Skeleton key={index} height={itemHeight} borderRadius={borderRadius} />
      ))}
    </View>
  );
}

import React, { useState } from "react";
import {
  Pressable,
  StyleSheet,
  View,
  type GestureResponderEvent,
  type LayoutChangeEvent,
} from "react-native";
import { PitchCourseGrid } from "@components/stats/PitchCourseGrid";
import {
  detectPitchCourse,
  pitchCourseCenter,
  pitchCourseLabel,
  type PitchCoursePoint,
} from "@constants/pitchCourse";

interface Props {
  /** タップ位置から導出済みのコース (1〜25)。 */
  course: number | null;
  /** タップ位置の正規化座標。座標を持たない既存レコードでは null。 */
  location: PitchCoursePoint | null;
  /** 未指定なら表示専用モード（打席詳細の読み取り専用プロット）。 */
  onSelect?: (args: { x: number; y: number; course: number }) => void;
  /** 図の一辺の長さ。既定は入力フォーム向けの 300。 */
  size?: number;
}

const MARKER_SIZE = 16;
const DEFAULT_FIELD_SIZE = 300;

const clampNormalized = (value: number): number =>
  Math.max(0, Math.min(1, value));

/**
 * 投球コースをコース図の自由な位置へのタップで指定するフィールド。
 * タップ座標から detectPitchCourse で 5x5 のどのコースかを導出し、
 * 該当マスをハイライトして「大まかにどのコースか」も同時に示す。
 */
export function PitchCourseTapField({
  course,
  location,
  onSelect,
  size = DEFAULT_FIELD_SIZE,
}: Props) {
  // 幅は端末サイズで変わるため、正規化には実測値が要る。
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const isInteractive = onSelect !== undefined;
  // 座標のない既存レコードはコースの中心にマーカーを置く。
  const marker =
    location ?? (course !== null ? pitchCourseCenter(course) : null);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setLayout({ width, height });
  };

  const handlePress = (event: GestureResponderEvent) => {
    if (!onSelect || layout.width === 0 || layout.height === 0) return;
    const x = clampNormalized(event.nativeEvent.locationX / layout.width);
    const y = clampNormalized(event.nativeEvent.locationY / layout.height);
    onSelect({ x, y, course: detectPitchCourse({ x, y }) });
  };

  return (
    <Pressable
      accessibilityRole={isInteractive ? "button" : "image"}
      accessibilityLabel="コース図"
      accessibilityHint={
        isInteractive ? "タップして投球コースを選択" : undefined
      }
      accessibilityValue={{
        text: course !== null ? pitchCourseLabel(course) : "未選択",
      }}
      disabled={!isInteractive}
      onLayout={handleLayout}
      onPress={handlePress}
      style={[styles.field, { height: size }]}
    >
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <PitchCourseGrid
          style={styles.grid}
          renderCell={(cellCourse, isStrikeZone) => (
            <View
              style={[
                styles.cell,
                isStrikeZone ? styles.cellStrike : styles.cellBall,
                cellCourse === course ? styles.cellSelected : null,
              ]}
            />
          )}
        />
      </View>
      {marker !== null ? (
        <View
          pointerEvents="none"
          style={[
            styles.marker,
            {
              left: `${marker.x * 100}%`,
              top: `${marker.y * 100}%`,
            },
          ]}
        />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  field: {
    width: "100%",
  },
  grid: {
    flex: 1,
  },
  cell: {
    flex: 1,
    borderRadius: 2,
  },
  cellBall: {
    backgroundColor: "#2a2a2a",
  },
  cellStrike: {
    backgroundColor: "#454545",
  },
  cellSelected: {
    backgroundColor: "rgba(208, 128, 0, 0.4)",
  },
  marker: {
    position: "absolute",
    width: MARKER_SIZE,
    height: MARKER_SIZE,
    marginLeft: -MARKER_SIZE / 2,
    marginTop: -MARKER_SIZE / 2,
    borderRadius: MARKER_SIZE / 2,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    backgroundColor: "#d08000",
  },
});

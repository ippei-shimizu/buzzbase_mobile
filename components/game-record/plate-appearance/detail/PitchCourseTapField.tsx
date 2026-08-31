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
  onSelect: (args: { x: number; y: number; course: number }) => void;
}

const MARKER_SIZE = 16;

const clampNormalized = (value: number): number =>
  Math.max(0, Math.min(1, value));

/**
 * 投球コースをコース図の自由な位置へのタップで指定するフィールド。
 * タップ座標から detectPitchCourse で 5x5 のどのコースかを導出し、
 * 該当マスをハイライトして「大まかにどのコースか」も同時に示す。
 */
export function PitchCourseTapField({ course, location, onSelect }: Props) {
  // 幅は端末サイズで変わるため、正規化には実測値が要る。
  const [size, setSize] = useState({ width: 0, height: 0 });
  // 座標のない既存レコードはコースの中心にマーカーを置く。
  const marker =
    location ?? (course !== null ? pitchCourseCenter(course) : null);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setSize({ width, height });
  };

  const handlePress = (event: GestureResponderEvent) => {
    if (size.width === 0 || size.height === 0) return;
    const x = clampNormalized(event.nativeEvent.locationX / size.width);
    const y = clampNormalized(event.nativeEvent.locationY / size.height);
    onSelect({ x, y, course: detectPitchCourse({ x, y }) });
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="コース図"
      accessibilityHint="タップして投球コースを選択"
      accessibilityValue={{
        text: course !== null ? pitchCourseLabel(course) : "未選択",
      }}
      onLayout={handleLayout}
      onPress={handlePress}
      style={styles.field}
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
    height: 300,
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

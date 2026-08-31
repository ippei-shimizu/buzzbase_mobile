import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { PitchCourseTapField } from "@components/game-record/plate-appearance/detail/PitchCourseTapField";
import { pitchCourseLabel } from "@constants/pitchCourse";

interface Props {
  course: number | null;
  // V2 レスポンスの pitch_course_x/y は DB decimal のため文字列で届く。
  pitchCourseX: string | null;
  pitchCourseY: string | null;
}

const FIELD_SIZE = 220;

const parseLocation = (value: string | null): number | null => {
  if (value === null) return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

/**
 * 記録済みの投球コースを読み取り専用のコース図にプロットする。
 * 座標を持たない既存レコードはコースの中心にマーカーが立つ。
 */
export function PitchCourseView({ course, pitchCourseX, pitchCourseY }: Props) {
  if (course === null) {
    return <Text style={styles.unrecorded}>未記録</Text>;
  }

  const x = parseLocation(pitchCourseX);
  const y = parseLocation(pitchCourseY);

  return (
    <View style={styles.container}>
      <View style={styles.field}>
        <PitchCourseTapField
          course={course}
          location={x !== null && y !== null ? { x, y } : null}
          size={FIELD_SIZE}
        />
      </View>
      <Text style={styles.label}>{pitchCourseLabel(course)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    gap: 8,
  },
  field: {
    width: FIELD_SIZE,
  },
  label: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 4,
    backgroundColor: "#d08000",
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    overflow: "hidden",
  },
  unrecorded: {
    color: "#71717A",
    fontSize: 13,
  },
});

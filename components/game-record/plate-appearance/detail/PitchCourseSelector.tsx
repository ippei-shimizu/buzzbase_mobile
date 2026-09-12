import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Svg, { Polygon } from "react-native-svg";
import {
  pitchCourseLabel,
  type PitchCoursePoint,
} from "@constants/pitchCourse";
import { PitchCourseTapField } from "./PitchCourseTapField";
import { SectionHeader } from "./SectionHeader";

interface Props {
  value: number | null;
  location: PitchCoursePoint | null;
  onChange: (
    value: { course: number; location: PitchCoursePoint } | null,
  ) => void;
  description?: string;
}

/**
 * 投球コース（捕手目線）の入力セレクタ。
 * コース図の任意の位置をタップして指定し、そこから導出した 5x5 のコースを
 * マスのハイライトとテキストで示す。「クリア」で未選択に戻せる。
 */
export function PitchCourseSelector({
  value,
  location,
  onChange,
  description,
}: Props) {
  return (
    <View style={styles.container}>
      <SectionHeader label="コース" description={description} />
      <View style={styles.body}>
        {/* 高さ方向の軸ラベル。外周を除いた内側3行の目安として等分配置する。 */}
        <View style={styles.verticalAxis}>
          <Text style={styles.axisLabel}>高め</Text>
          <Text style={styles.axisLabel}>真ん中</Text>
          <Text style={styles.axisLabel}>低め</Text>
        </View>
        <View style={styles.gridColumn}>
          <PitchCourseTapField
            course={value}
            location={location}
            onSelect={({ x, y, course }) =>
              onChange({ course, location: { x, y } })
            }
          />
          <View style={styles.horizontalAxis}>
            <Text style={styles.axisLabel}>三塁側</Text>
            <Text style={styles.axisLabel}>真ん中</Text>
            <Text style={styles.axisLabel}>一塁側</Text>
          </View>
          <View style={styles.homePlate}>
            <Svg width={56} height={26} viewBox="0 0 56 26">
              <Polygon
                points="2,2 54,2 54,12 28,24 2,12"
                fill="none"
                stroke="#71717a"
                strokeWidth={2}
              />
            </Svg>
          </View>
        </View>
      </View>
      <View style={styles.selectionRow}>
        <Text
          accessibilityLiveRegion="polite"
          style={[
            styles.selectionChip,
            value === null ? styles.selectionChipEmpty : null,
          ]}
        >
          {value !== null ? pitchCourseLabel(value) : "未選択"}
        </Text>
        {value !== null ? (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="コースをクリア"
            onPress={() => onChange(null)}
            style={styles.clearButton}
          >
            <Text style={styles.clearText}>クリア</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 0,
  },
  body: {
    flexDirection: "row",
    gap: 8,
  },
  verticalAxis: {
    justifyContent: "space-around",
    paddingVertical: 32,
  },
  gridColumn: {
    flex: 1,
    maxWidth: 300,
  },
  horizontalAxis: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 4,
  },
  homePlate: {
    alignItems: "center",
    paddingTop: 4,
  },
  axisLabel: {
    color: "#71717A",
    fontSize: 10,
  },
  selectionRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  // ダイヤモンドの塗りだけでは選択位置が読み取りづらいため、チップで明示する。
  selectionChip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 4,
    backgroundColor: "#d08000",
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    overflow: "hidden",
  },
  selectionChipEmpty: {
    backgroundColor: "#3A3A3A",
    color: "#A1A1AA",
  },
  clearButton: {
    position: "absolute",
    right: 0,
    padding: 4,
  },
  clearText: {
    color: "#A1A1AA",
    fontSize: 12,
    textDecorationLine: "underline",
  },
});

import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Svg, { Polygon } from "react-native-svg";
import { PitchCourseGrid } from "@components/stats/PitchCourseGrid";
import { pitchCourseLabel } from "@constants/pitchCourse";
import { SectionHeader } from "./SectionHeader";

interface Props {
  value: number | null;
  onChange: (value: number | null) => void;
  description?: string;
}

/**
 * 投球コース（捕手目線 5x5）の入力セレクタ。
 * 選択済みセルの再タップ、または「クリア」で解除できる。
 */
export function PitchCourseSelector({ value, onChange, description }: Props) {
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
          <PitchCourseGrid
            style={styles.grid}
            renderCell={(course, isStrikeZone) => {
              const isSelected = value === course;
              return (
                <TouchableOpacity
                  accessibilityRole="radio"
                  accessibilityLabel={pitchCourseLabel(course)}
                  accessibilityState={{ selected: isSelected }}
                  style={[
                    styles.cellButton,
                    isStrikeZone ? styles.cellStrike : styles.cellBall,
                    isSelected && styles.cellSelected,
                  ]}
                  onPress={() => onChange(isSelected ? null : course)}
                />
              );
            }}
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
      <Text accessibilityLiveRegion="polite" style={styles.selectionLabel}>
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
  grid: {
    height: 300,
  },
  cellButton: {
    flex: 1,
    borderRadius: 2,
  },
  // 最小タップ領域 44px は外周セル（300 * 0.62 / 4.24 ≈ 44px）で実寸確保する。
  cellBall: {
    backgroundColor: "#2a2a2a",
  },
  cellStrike: {
    backgroundColor: "#454545",
  },
  cellSelected: {
    backgroundColor: "#d08000",
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
  selectionLabel: {
    marginTop: 8,
    color: "#D4D4D8",
    fontSize: 12,
  },
  clearButton: {
    alignSelf: "flex-start",
    marginTop: 4,
    padding: 4,
  },
  clearText: {
    color: "#A1A1AA",
    fontSize: 12,
    textDecorationLine: "underline",
  },
});

import React from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { isStrikeZoneCourse } from "@constants/pitchCourse";

interface Props {
  /** 各セルの中身（ボタンや色付き View）。セル枠・ストライクゾーン枠線はグリッド側が描く。 */
  renderCell: (course: number, isStrikeZone: boolean) => React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

// 外周のボールゾーンは内側より細くする（行・列とも 0.62 : 1 : 1 : 1 : 0.62）。
const TRACK_FLEX = [0.62, 1, 1, 1, 0.62];

// ストライクゾーン（中央3x3）の外周にだけ実線ボーダーを引く。
const strikeZoneBorder = (row: number, col: number): ViewStyle => {
  const style: ViewStyle = {};
  if (row === 2) style.borderTopWidth = 2;
  if (row === 4) style.borderBottomWidth = 2;
  if (col === 2) style.borderLeftWidth = 2;
  if (col === 4) style.borderRightWidth = 2;
  style.borderColor = "#E4E4E7";
  return style;
};

/**
 * 投球コースの 5x5 グリッド（捕手目線）。入力セレクタと分析ヒートマップで
 * 同じ幾何を共有する presentational コンポーネント。
 */
export function PitchCourseGrid({ renderCell, style }: Props) {
  return (
    <View style={[styles.grid, style]}>
      {TRACK_FLEX.map((rowFlex, rowIndex) => (
        <View key={rowIndex} style={[styles.row, { flex: rowFlex }]}>
          {TRACK_FLEX.map((colFlex, colIndex) => {
            const course = rowIndex * 5 + colIndex + 1;
            const isStrikeZone = isStrikeZoneCourse(course);
            return (
              <View
                key={course}
                style={[
                  styles.cell,
                  { flex: colFlex },
                  isStrikeZone
                    ? strikeZoneBorder(rowIndex + 1, colIndex + 1)
                    : null,
                ]}
              >
                {renderCell(course, isStrikeZone)}
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    width: "100%",
    gap: 1,
  },
  row: {
    flexDirection: "row",
    gap: 1,
  },
  cell: {},
});

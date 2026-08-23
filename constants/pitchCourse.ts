import type { BattingSide } from "./handedness";

// 投球コース（plate_appearances.pitch_course）。捕手目線・行優先の 5x5 グリッド
// （左上=1 〜 右下=25）。保存値は打者の左右でミラーせず常に捕手目線の絶対座標。
// back の PlateAppearance::PITCH_COURSES / STRIKE_ZONE_COURSES と一致させる。
export const PITCH_COURSES: readonly number[] = Array.from(
  { length: 25 },
  (_, index) => index + 1,
);

// 中央 3x3 がストライクゾーン。
export const STRIKE_ZONE_COURSES: readonly number[] = [
  7, 8, 9, 12, 13, 14, 17, 18, 19,
];

const STRIKE_ZONE_SET = new Set(STRIKE_ZONE_COURSES);

/** コース番号 (1〜25) → 行 (1〜5)。 */
export const pitchCourseRow = (course: number): number =>
  Math.floor((course - 1) / 5) + 1;

/** コース番号 (1〜25) → 列 (1〜5)。捕手目線で左から数える。 */
export const pitchCourseCol = (course: number): number =>
  ((course - 1) % 5) + 1;

export const isStrikeZoneCourse = (course: number): boolean =>
  STRIKE_ZONE_SET.has(course);

/** 高さ方向のラベル（行 1-2: 高め / 3: 真ん中 / 4-5: 低め）。 */
export const pitchCourseHeightLabel = (course: number): string => {
  const row = pitchCourseRow(course);
  if (row <= 2) return "高め";
  if (row === 3) return "真ん中";
  return "低め";
};

/**
 * 横方向のラベル。打席（batting_side）が分かるときだけ内角/外角で表現し、
 * 未設定・両打ちは捕手目線の「三塁側/一塁側」にフォールバックする。
 * 捕手目線では左（列1-2）が三塁側 = 右打者の内角。
 */
export const pitchCourseSideLabel = (
  course: number,
  battingSide: BattingSide | null = null,
): string => {
  const col = pitchCourseCol(course);
  if (col === 3) return "真ん中";
  const isThirdBaseSide = col <= 2;
  if (battingSide === "right") return isThirdBaseSide ? "内角" : "外角";
  if (battingSide === "left") return isThirdBaseSide ? "外角" : "内角";
  return isThirdBaseSide ? "三塁側" : "一塁側";
};

/**
 * 選択中コースの説明ラベル（例: 「高め・三塁側寄り（ボール）」「真ん中（ストライク）」）。
 */
export const pitchCourseLabel = (
  course: number,
  battingSide: BattingSide | null = null,
): string => {
  const height = pitchCourseHeightLabel(course);
  const side = pitchCourseSideLabel(course, battingSide);
  const zone = isStrikeZoneCourse(course) ? "ストライク" : "ボール";
  const position =
    height === "真ん中" && side === "真ん中"
      ? "真ん中"
      : `${height}・${side === "真ん中" ? "真ん中" : `${side}寄り`}`;
  return `${position}（${zone}）`;
};

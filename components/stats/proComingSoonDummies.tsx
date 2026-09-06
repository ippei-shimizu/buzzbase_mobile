import type { PitchCourseData, PitchCourseZone } from "../../types/stats";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

/**
 * Pro プラン Coming soon カードのサンプル表示用ダミー body。
 * 数値はすべてダミー固定値で正確さは不要。レイアウトに似せて「何ができる機能か」を視覚的に伝える役割を持つ。
 * 球種別・対戦投手別はタップ展開込みで実コンポーネント（PitchTypeCard/PitcherFaceoffList）に
 * サンプルデータを渡す方式のため、ここには含まれない（app/(tabs)/stats.tsx を参照）。
 * 方向別の球場図は ProComingSoonHitDirectionField.tsx を参照。
 */

export function CountSituationDummy() {
  const columns = [
    { label: "初球", average: ".333", count: "9打数 3安打" },
    { label: "有利カウント", average: ".286", count: "14打数 4安打" },
    { label: "追い込み", average: ".214", count: "28打数 6安打" },
  ];
  return (
    <View style={styles.countRow}>
      {columns.map((column) => (
        <View key={column.label} style={styles.countCell}>
          <Text style={styles.countLabel}>{column.label}</Text>
          <Text style={styles.countAverage}>{column.average}</Text>
          <Text style={styles.countSub}>{column.count}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  countRow: {
    flexDirection: "row",
    gap: 8,
  },
  countCell: {
    flex: 1,
    backgroundColor: "#27272A",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: "center",
    gap: 4,
  },
  countLabel: {
    color: "#A1A1AA",
    fontSize: 11,
    fontWeight: "600",
  },
  countAverage: {
    color: "#F4F4F4",
    fontSize: 22,
    fontWeight: "800",
  },
  countSub: {
    color: "#71717A",
    fontSize: 10,
  },
});

/**
 * コース別の打率カードのサンプルデータ（PitchCourseCard に渡す）。
 * 真ん中〜内寄りが得意、外角低めが苦手という分かりやすい傾向を作る。
 */
const DUMMY_PITCH_COURSE_SEEDS: readonly [number, number, number][] = [
  [7, 6, 2],
  [8, 8, 3],
  [9, 5, 1],
  [12, 10, 4],
  [13, 14, 6],
  [14, 8, 2],
  [17, 9, 3],
  [18, 12, 4],
  [19, 7, 1],
  [2, 3, 1],
  [10, 2, 0],
  [16, 4, 1],
  [22, 2, 0],
  [24, 1, 0],
];

const STRIKE_ZONE = new Set([7, 8, 9, 12, 13, 14, 17, 18, 19]);

const DUMMY_PITCH_COURSE_ZONES: PitchCourseZone[] = Array.from(
  { length: 25 },
  (_, index) => {
    const course = index + 1;
    const seed = DUMMY_PITCH_COURSE_SEEDS.find(([c]) => c === course);
    const atBats = seed?.[1] ?? 0;
    const hits = seed?.[2] ?? 0;
    return {
      course,
      row: Math.floor((course - 1) / 5) + 1,
      col: ((course - 1) % 5) + 1,
      is_strike_zone: STRIKE_ZONE.has(course),
      plate_appearances: atBats,
      at_bats: atBats,
      hits,
      batting_average: atBats > 0 ? Number((hits / atBats).toFixed(3)) : 0,
      is_reliable: atBats >= 3,
    };
  },
);

const sumDummyZones = (zones: PitchCourseZone[]) => {
  const atBats = zones.reduce((sum, z) => sum + z.at_bats, 0);
  const hits = zones.reduce((sum, z) => sum + z.hits, 0);
  return {
    plate_appearances: zones.reduce((sum, z) => sum + z.plate_appearances, 0),
    at_bats: atBats,
    hits,
    batting_average: atBats > 0 ? Number((hits / atBats).toFixed(3)) : 0,
  };
};

export const DUMMY_PITCH_COURSES: PitchCourseData = {
  zones: DUMMY_PITCH_COURSE_ZONES,
  strike_zone: sumDummyZones(
    DUMMY_PITCH_COURSE_ZONES.filter((z) => z.is_strike_zone),
  ),
  ball_zone: sumDummyZones(
    DUMMY_PITCH_COURSE_ZONES.filter((z) => !z.is_strike_zone),
  ),
  total_target_pa: DUMMY_PITCH_COURSE_ZONES.reduce(
    (sum, z) => sum + z.plate_appearances,
    0,
  ),
  min_at_bats: 3,
};

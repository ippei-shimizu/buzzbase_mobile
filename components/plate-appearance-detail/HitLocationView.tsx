import React from "react";
import { StyleSheet, Text } from "react-native";
import { GroundTapField } from "@components/game-record/plate-appearance/GroundTapField";

interface Props {
  // V2 レスポンスの hit_location_x/y は DB decimal のため文字列で届く。
  hitLocationX: string | null;
  hitLocationY: string | null;
}

/**
 * 記録済みの打球位置を読み取り専用のグラウンドにプロットする。
 * Number() 変換を挟まないと SVG 座標が NaN になる点に注意。
 */
export function HitLocationView({ hitLocationX, hitLocationY }: Props) {
  const x = hitLocationX !== null ? Number(hitLocationX) : null;
  const y = hitLocationY !== null ? Number(hitLocationY) : null;
  const hitLocation =
    x !== null && y !== null && !Number.isNaN(x) && !Number.isNaN(y)
      ? { x, y }
      : null;

  if (hitLocation === null) {
    return <Text style={styles.unrecorded}>未記録</Text>;
  }

  return <GroundTapField hitLocation={hitLocation} />;
}

const styles = StyleSheet.create({
  unrecorded: {
    color: "#71717A",
    fontSize: 13,
  },
});

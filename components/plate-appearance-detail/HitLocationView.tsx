import React, { useState } from "react";
import { StyleSheet, Text, View, type LayoutChangeEvent } from "react-native";
import { GroundTapField } from "@components/game-record/plate-appearance/GroundTapField";
import { GROUND_CANVAS_WIDTH } from "@constants/groundCanvas";

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
  // キャンバス実寸は端末幅より広いため、親の幅に収まるよう縮小して描画する。
  const [availableWidth, setAvailableWidth] = useState<number | null>(null);
  const handleLayout = (event: LayoutChangeEvent) =>
    setAvailableWidth(event.nativeEvent.layout.width);

  const x = hitLocationX !== null ? Number(hitLocationX) : null;
  const y = hitLocationY !== null ? Number(hitLocationY) : null;
  const hitLocation =
    x !== null && y !== null && !Number.isNaN(x) && !Number.isNaN(y)
      ? { x, y }
      : null;

  if (hitLocation === null) {
    return <Text style={styles.unrecorded}>未記録</Text>;
  }

  return (
    <View style={styles.container} onLayout={handleLayout}>
      <GroundTapField
        hitLocation={hitLocation}
        width={
          availableWidth === null
            ? undefined
            : Math.min(availableWidth, GROUND_CANVAS_WIDTH)
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
  },
  unrecorded: {
    color: "#71717A",
    fontSize: 13,
  },
});

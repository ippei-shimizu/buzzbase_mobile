import type { HitDirectionWithZones, Point } from "../../../types/hitDirection";
import {
  Pressable,
  StyleSheet,
  View,
  type GestureResponderEvent,
} from "react-native";
import Svg, { Circle, Line, Path, Polygon, Rect } from "react-native-svg";
import {
  GROUND_CANVAS_HEIGHT,
  GROUND_CANVAS_WIDTH,
} from "@constants/groundCanvas";
import { detectZone } from "@utils/groundZoneDetector";

interface Props {
  hitDirections: HitDirectionWithZones[];
  hitLocation: Point | null;
  onTap: (args: {
    x: number;
    y: number;
    directionId: number | null;
    depthId: number | null;
  }) => void;
}

const HOME = { x: 210, y: 295 };
const FIRST = { x: 268, y: 238 };
const SECOND = { x: 210, y: 185 };
const THIRD = { x: 152, y: 238 };
const OUTFIELD_R = 250;
const LEFT_END = {
  x: HOME.x + OUTFIELD_R * Math.cos((135 * Math.PI) / 180),
  y: HOME.y - OUTFIELD_R * Math.sin((135 * Math.PI) / 180),
};
const RIGHT_END = {
  x: HOME.x + OUTFIELD_R * Math.cos((45 * Math.PI) / 180),
  y: HOME.y - OUTFIELD_R * Math.sin((45 * Math.PI) / 180),
};
const MOUND = { x: HOME.x, y: (HOME.y + SECOND.y) / 2 + 5 };

const clampNormalized = (value: number): number =>
  Math.max(0, Math.min(1, value));

/**
 * 打席記録ステップ式 UI のグラウンドイラスト。
 * タップで打球方向の絶対座標を 0〜1 の正規化座標として取得し、
 * `detectZone` で `hit_direction_id` / `hit_depth_id` を導出する。
 *
 * 描画は SprayChart の簡略版（フェンス・ダイヤモンド・マウンド・ベース）に絞り、
 * 集計バブル等は持たない。タップ位置にはマーカー（オレンジの円）を 1 つ重ねる。
 */
export function GroundTapField({ hitDirections, hitLocation, onTap }: Props) {
  const handlePress = (event: GestureResponderEvent) => {
    const xNorm = clampNormalized(
      event.nativeEvent.locationX / GROUND_CANVAS_WIDTH,
    );
    const yNorm = clampNormalized(
      event.nativeEvent.locationY / GROUND_CANVAS_HEIGHT,
    );
    const zone = detectZone({ x: xNorm, y: yNorm }, hitDirections);
    onTap({
      x: xNorm,
      y: yNorm,
      directionId: zone?.direction_id ?? null,
      depthId: zone?.depth_id ?? null,
    });
  };

  const markerX =
    hitLocation !== null ? hitLocation.x * GROUND_CANVAS_WIDTH : null;
  const markerY =
    hitLocation !== null ? hitLocation.y * GROUND_CANVAS_HEIGHT : null;

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="グラウンド"
        accessibilityHint="タップして打球方向を選択"
        onPress={handlePress}
        style={styles.tapArea}
      >
        <Svg
          width={GROUND_CANVAS_WIDTH}
          height={GROUND_CANVAS_HEIGHT}
          viewBox={`0 0 ${GROUND_CANVAS_WIDTH} ${GROUND_CANVAS_HEIGHT}`}
        >
          <Path
            d={`M ${HOME.x},${HOME.y} L ${LEFT_END.x},${LEFT_END.y} A ${OUTFIELD_R},${OUTFIELD_R} 0 0,1 ${RIGHT_END.x},${RIGHT_END.y} Z`}
            fill="#4a8e32"
            stroke="#3a7a28"
            strokeWidth={2}
          />
          <Path
            d={`M ${HOME.x},${HOME.y - 15} L ${FIRST.x - 5},${FIRST.y + 2} L ${SECOND.x},${SECOND.y + 8} L ${THIRD.x + 5},${THIRD.y + 2} Z`}
            fill="#5fa341"
          />
          <Line
            x1={HOME.x}
            y1={HOME.y}
            x2={LEFT_END.x}
            y2={LEFT_END.y}
            stroke="rgba(255,255,255,0.6)"
            strokeWidth={1.5}
          />
          <Line
            x1={HOME.x}
            y1={HOME.y}
            x2={RIGHT_END.x}
            y2={RIGHT_END.y}
            stroke="rgba(255,255,255,0.6)"
            strokeWidth={1.5}
          />
          <Line
            x1={HOME.x}
            y1={HOME.y - 3}
            x2={FIRST.x}
            y2={FIRST.y}
            stroke="rgba(255,255,255,0.7)"
            strokeWidth={1.5}
          />
          <Line
            x1={FIRST.x}
            y1={FIRST.y}
            x2={SECOND.x}
            y2={SECOND.y}
            stroke="rgba(255,255,255,0.7)"
            strokeWidth={1.5}
          />
          <Line
            x1={SECOND.x}
            y1={SECOND.y}
            x2={THIRD.x}
            y2={THIRD.y}
            stroke="rgba(255,255,255,0.7)"
            strokeWidth={1.5}
          />
          <Line
            x1={THIRD.x}
            y1={THIRD.y}
            x2={HOME.x}
            y2={HOME.y - 3}
            stroke="rgba(255,255,255,0.7)"
            strokeWidth={1.5}
          />
          <Circle cx={MOUND.x} cy={MOUND.y} r={9} fill="#9a6d3a" />
          <Polygon
            points={`${HOME.x},${HOME.y - 8} ${HOME.x - 6},${HOME.y - 3} ${HOME.x - 4},${HOME.y + 2} ${HOME.x + 4},${HOME.y + 2} ${HOME.x + 6},${HOME.y - 3}`}
            fill="white"
          />
          <Rect
            x={FIRST.x - 4}
            y={FIRST.y - 4}
            width={8}
            height={8}
            fill="white"
            transform={`rotate(45, ${FIRST.x}, ${FIRST.y})`}
          />
          <Rect
            x={SECOND.x - 4}
            y={SECOND.y - 4}
            width={8}
            height={8}
            fill="white"
            transform={`rotate(45, ${SECOND.x}, ${SECOND.y})`}
          />
          <Rect
            x={THIRD.x - 4}
            y={THIRD.y - 4}
            width={8}
            height={8}
            fill="white"
            transform={`rotate(45, ${THIRD.x}, ${THIRD.y})`}
          />
          {markerX !== null && markerY !== null && (
            <>
              <Circle
                cx={markerX}
                cy={markerY}
                r={10}
                fill="#d08000"
                opacity={0.35}
              />
              <Circle cx={markerX} cy={markerY} r={6} fill="#d08000" />
            </>
          )}
        </Svg>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  tapArea: {
    width: GROUND_CANVAS_WIDTH,
    height: GROUND_CANVAS_HEIGHT,
  },
});

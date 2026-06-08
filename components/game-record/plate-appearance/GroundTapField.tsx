import type { HitDirectionWithZones, Point } from "../../../types/hitDirection";
import { useEffect, useMemo } from "react";
import {
  Pressable,
  StyleSheet,
  View,
  type GestureResponderEvent,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Svg, {
  Circle,
  G,
  Line,
  Path,
  Polygon,
  Rect,
  Text as SvgText,
} from "react-native-svg";
import {
  DIRECTION_LABEL_POSITIONS,
  DIRECTION_LABELS,
  GROUND_CANVAS_HEIGHT,
  GROUND_CANVAS_WIDTH,
} from "@constants/groundCanvas";
import { detectClosestDirection } from "@utils/groundZoneDetector";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const PULSE_DURATION_MS = 2800;
const PULSE_START_RADIUS = 10;
const PULSE_END_RADIUS = 42;

/**
 * 選択中ラベル位置にパルス（波紋）を 1 つ描画する Circle。
 * `delay` をずらした複数を重ねることで、中心から波形が広がる視覚を作る。
 */
function PulseCircle({
  cx,
  cy,
  delay,
}: {
  cx: number;
  cy: number;
  delay: number;
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, {
          duration: PULSE_DURATION_MS,
          easing: Easing.out(Easing.quad),
        }),
        -1,
        false,
      ),
    );
  }, [progress, delay]);

  const animatedProps = useAnimatedProps(() => ({
    r:
      PULSE_START_RADIUS +
      (PULSE_END_RADIUS - PULSE_START_RADIUS) * progress.value,
    opacity: 0.7 * (1 - progress.value),
  }));

  return (
    <AnimatedCircle
      cx={cx}
      cy={cy}
      fill="none"
      stroke="#d08000"
      strokeWidth={2}
      animatedProps={animatedProps}
    />
  );
}

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

// ホームをキャンバス下端付近に置き、外野円弧がほぼキャンバス上端まで広がる比率にする。
const HOME = { x: 210, y: 315 };
// 内野ダイヤモンドは HOME→SECOND の対角線 150px を中心に、
// 一辺が約 106px の正方形を 45° 回転した正菱形。
const FIRST = { x: 285, y: 240 };
const SECOND = { x: 210, y: 165 };
const THIRD = { x: 135, y: 240 };
// 外野フェンスは楕円弧で描く。target 画像（鳥瞰イラスト）に合わせて
// 縦長やや浅めの楕円にし、ファウルライン端からセンター方向に滑らかに膨らむ形にする。
const OUTFIELD_RX = 235;
const OUTFIELD_RY = 295;
// HOME を通る ±45° のファウルライン上で楕円と交わる点までの距離。
// (x-cx)² / rx² + (y-cy)² / ry² = 1 を y = x の傾きの直線で解いて求める。
const FAUL_LINE_DIST = Math.sqrt(
  (OUTFIELD_RX ** 2 * OUTFIELD_RY ** 2) / (OUTFIELD_RX ** 2 + OUTFIELD_RY ** 2),
);
const LEFT_END = {
  x: HOME.x - FAUL_LINE_DIST,
  y: HOME.y - FAUL_LINE_DIST,
};
const RIGHT_END = {
  x: HOME.x + FAUL_LINE_DIST,
  y: HOME.y - FAUL_LINE_DIST,
};
const MOUND = { x: HOME.x, y: (HOME.y + SECOND.y) / 2 + 5 };
// 内野ダート（茶色）はダイヤモンド中心の円を、左右のファウルラインで切った形にする。
// これによりファウルライン外側（ファウルゾーン側）にはダート（茶色）が出なくなる。
const DIRT_CENTER = { x: HOME.x, y: (HOME.y + SECOND.y) / 2 };
const DIRT_R = 95;
// HOME を通る ±45° のファウルラインと円の交点（ダイヤモンド側）を計算する。
// ファウルラインへの中心からの垂線最寄り点 (HOME.x - dy/2, HOME.y - dy/2) から
// ライン方向に半弦 (chordHalf) ずつ離れた点が交点になる。
const DIRT_DY = HOME.y - DIRT_CENTER.y;
const DIRT_LINE_CHORD = Math.sqrt(DIRT_R ** 2 - DIRT_DY ** 2 / 2);
const DIRT_FOUL_LEFT = {
  x: HOME.x - DIRT_DY / 2 - DIRT_LINE_CHORD / Math.SQRT2,
  y: HOME.y - DIRT_DY / 2 - DIRT_LINE_CHORD / Math.SQRT2,
};
const DIRT_FOUL_RIGHT = {
  x: HOME.x + DIRT_DY / 2 + DIRT_LINE_CHORD / Math.SQRT2,
  y: HOME.y - DIRT_DY / 2 - DIRT_LINE_CHORD / Math.SQRT2,
};

const CHIP_HEIGHT = 18;
const CHIP_PADDING_X = 6;
const CHIP_FONT_SIZE = 11;
const CHIP_TEXT_BASELINE_OFFSET = 4;

const clampNormalized = (value: number): number =>
  Math.max(0, Math.min(1, value));

/** 1 文字あたりの想定幅（fontSize に合わせた近似値）。 */
const estimateChipWidth = (label: string): number =>
  CHIP_PADDING_X * 2 + label.length * 12;

/**
 * 打席記録ステップ式 UI のグラウンドイラスト。
 * タップで打球方向の絶対座標を 0〜1 の正規化座標として取得し、
 * `detectZone` で `hit_direction_id` / `hit_depth_id` を導出する。
 *
 * 描画は SprayChart の簡略版（フェンス・ダイヤモンド・マウンド・ベース）に絞り、
 * 13 方向それぞれのラベル chip を重ねる。タップ済みでゾーン判定が成立している
 * 方向の chip は primary 色でハイライトし、どの方向で記録されるかをユーザーに明示する。
 */
export function GroundTapField({ hitDirections, hitLocation, onTap }: Props) {
  const handlePress = (event: GestureResponderEvent) => {
    const xNorm = clampNormalized(
      event.nativeEvent.locationX / GROUND_CANVAS_WIDTH,
    );
    const yNorm = clampNormalized(
      event.nativeEvent.locationY / GROUND_CANVAS_HEIGHT,
    );
    const directionId = detectClosestDirection({ x: xNorm, y: yNorm });
    onTap({
      x: xNorm,
      y: yNorm,
      directionId,
      depthId: null,
    });
  };

  const markerX =
    hitLocation !== null ? hitLocation.x * GROUND_CANVAS_WIDTH : null;
  const markerY =
    hitLocation !== null ? hitLocation.y * GROUND_CANVAS_HEIGHT : null;

  const selectedDirectionId = useMemo(() => {
    if (!hitLocation) return null;
    return detectClosestDirection(hitLocation);
  }, [hitLocation]);

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
            d={`M ${HOME.x},${HOME.y} L ${LEFT_END.x},${LEFT_END.y} A ${OUTFIELD_RX},${OUTFIELD_RY} 0 0,1 ${RIGHT_END.x},${RIGHT_END.y} Z`}
            fill="#4a8e32"
            stroke="#3a7a28"
            strokeWidth={2}
          />
          <Path
            d={`M ${HOME.x},${HOME.y} L ${DIRT_FOUL_LEFT.x},${DIRT_FOUL_LEFT.y} A ${DIRT_R},${DIRT_R} 0 0,1 ${DIRT_FOUL_RIGHT.x},${DIRT_FOUL_RIGHT.y} Z`}
            fill="#b07840"
          />
          <Path
            d={`M ${HOME.x},${HOME.y} L ${FIRST.x},${FIRST.y} L ${SECOND.x},${SECOND.y} L ${THIRD.x},${THIRD.y} Z`}
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
          {selectedDirectionId !== null &&
            DIRECTION_LABEL_POSITIONS[selectedDirectionId] && (
              <G key={`pulse-${selectedDirectionId}`} pointerEvents="none">
                <PulseCircle
                  cx={DIRECTION_LABEL_POSITIONS[selectedDirectionId].x}
                  cy={DIRECTION_LABEL_POSITIONS[selectedDirectionId].y}
                  delay={0}
                />
                <PulseCircle
                  cx={DIRECTION_LABEL_POSITIONS[selectedDirectionId].x}
                  cy={DIRECTION_LABEL_POSITIONS[selectedDirectionId].y}
                  delay={PULSE_DURATION_MS / 3}
                />
                <PulseCircle
                  cx={DIRECTION_LABEL_POSITIONS[selectedDirectionId].x}
                  cy={DIRECTION_LABEL_POSITIONS[selectedDirectionId].y}
                  delay={(PULSE_DURATION_MS / 3) * 2}
                />
              </G>
            )}
          {Object.entries(DIRECTION_LABELS).map(([idKey, label]) => {
            const id = Number(idKey);
            const position = DIRECTION_LABEL_POSITIONS[id];
            if (!position) return null;
            const chipWidth = estimateChipWidth(label);
            const isSelected = selectedDirectionId === id;
            return (
              <G key={`dir-${id}`}>
                <Rect
                  x={position.x - chipWidth / 2}
                  y={position.y - CHIP_HEIGHT / 2}
                  width={chipWidth}
                  height={CHIP_HEIGHT}
                  rx={4}
                  fill={isSelected ? "#d08000" : "rgba(0,0,0,0.65)"}
                />
                <SvgText
                  x={position.x}
                  y={position.y + CHIP_TEXT_BASELINE_OFFSET}
                  fill="#F4F4F4"
                  fontSize={CHIP_FONT_SIZE}
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {label}
                </SvgText>
              </G>
            );
          })}
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

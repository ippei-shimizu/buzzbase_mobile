import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedProps,
  type SharedValue,
} from "react-native-reanimated";
import Svg, { Circle, G } from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const SIZE = 260;
const STROKE = 14;
const RADIUS = (SIZE - STROKE) / 2;
const CENTER = SIZE / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface Props {
  /** 0→1 を1インターバルで1周する、ストップウォッチ針相当の進捗（reanimated 共有値） */
  sweep: SharedValue<number>;
  count: number;
  targetCount: number;
}

/**
 * 素振りのインターバルを1周＝1本のテンポとして可視化する円形タイマー。
 * リング（弧）と先端のドットが `sweep` に追従し、中央に現在の本数を表示する。
 */
export function CircularTimer({ sweep, count, targetCount }: Props) {
  const arcProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - sweep.value),
  }));

  // 先端ドットは 12 時（-90°）を起点に時計回りへ進める。
  const handProps = useAnimatedProps(() => {
    const angle = sweep.value * 2 * Math.PI - Math.PI / 2;
    return {
      cx: CENTER + RADIUS * Math.cos(angle),
      cy: CENTER + RADIUS * Math.sin(angle),
    };
  });

  return (
    <View style={styles.wrap}>
      <Svg width={SIZE} height={SIZE}>
        <G rotation={-90} origin={`${CENTER}, ${CENTER}`}>
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            stroke="#424242"
            strokeWidth={STROKE}
            fill="none"
          />
          <AnimatedCircle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            stroke="#d08000"
            strokeWidth={STROKE}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={CIRCUMFERENCE}
            animatedProps={arcProps}
          />
        </G>
        <AnimatedCircle
          r={STROKE / 2 + 2}
          fill="#F4F4F4"
          animatedProps={handProps}
        />
      </Svg>
      <View style={styles.center} pointerEvents="none">
        <Text style={styles.count}>{count}</Text>
        <Text style={styles.target}>/ {targetCount}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: SIZE,
    height: SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  count: { color: "#F4F4F4", fontSize: 72, fontWeight: "800" },
  target: { color: "#A1A1AA", fontSize: 22, fontWeight: "600", marginTop: 4 },
});

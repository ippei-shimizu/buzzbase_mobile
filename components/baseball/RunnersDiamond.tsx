import type { RunnersState } from "../../types/plateAppearance";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Svg, { Polygon } from "react-native-svg";
import {
  RUNNERS_STATE_OPTIONS,
  basesToRunnersState,
  runnersStateToBases,
  type RunnersBases,
} from "@constants/runnersState";

interface Props {
  value: RunnersState | null;
  /** 未指定なら表示専用モード（支援技術にはラベル文字列のみを公開する）。 */
  onChange?: (value: RunnersState | null) => void;
}

const RUNNERS_STATE_LABELS: Record<string, string> = Object.fromEntries(
  RUNNERS_STATE_OPTIONS.map((option) => [option.key, option.label]),
);

// 下=本塁（装飾のみ）/ 右=一塁 / 上=二塁 / 左=三塁 の空間配置。
const BASES: readonly {
  key: keyof RunnersBases;
  label: string;
  position: { top?: number; left?: number; right?: number };
}[] = [
  { key: "second", label: "二塁", position: { top: 0, left: 54 } },
  { key: "third", label: "三塁", position: { top: 44, left: 0 } },
  { key: "first", label: "一塁", position: { top: 44, right: 0 } },
];

function BaseMarker({ occupied }: { occupied: boolean }) {
  return (
    <View
      style={[styles.baseMarker, occupied ? styles.baseOn : styles.baseOff]}
    >
      {occupied ? <View style={styles.baseInnerDot} /> : null}
    </View>
  );
}

/**
 * ランナー状況を各塁のタップでトグルするダイヤモンド UI。
 * - 初期値 null は全塁 OFF + キャプション「未入力」
 * - 最後の 1 塁を OFF にしたら no_runner（明示的な操作 = 無走者を記録した）
 * - 「未入力に戻す」で null へ戻せる
 * onChange 未指定時は表示専用（accessibilityRole=image）として描画する。
 */
export function RunnersDiamond({ value, onChange }: Props) {
  const bases = runnersStateToBases(value);
  const caption = value === null ? "未入力" : RUNNERS_STATE_LABELS[value];
  const isInteractive = onChange !== undefined;

  const handleToggle = (key: keyof RunnersBases) => {
    if (!onChange) return;
    const next = { ...bases, [key]: !bases[key] };
    onChange(basesToRunnersState(next));
  };

  const diamond = (
    <View style={styles.diamond}>
      {BASES.map((base) =>
        isInteractive ? (
          <TouchableOpacity
            key={base.key}
            accessibilityRole="button"
            accessibilityLabel={base.label}
            accessibilityState={{ selected: bases[base.key] }}
            hitSlop={8}
            style={[styles.baseTouchable, base.position]}
            onPress={() => handleToggle(base.key)}
          >
            <BaseMarker occupied={bases[base.key]} />
          </TouchableOpacity>
        ) : (
          <View key={base.key} style={[styles.baseTouchable, base.position]}>
            <BaseMarker occupied={bases[base.key]} />
          </View>
        ),
      )}
      {/* 本塁（装飾のみ、タップ不可） */}
      <View style={styles.homePlate}>
        <Svg width={22} height={20} viewBox="0 0 22 20">
          <Polygon
            points="1,1 21,1 21,9 11,19 1,9"
            fill="none"
            stroke="#71717a"
            strokeWidth={2}
          />
        </Svg>
      </View>
    </View>
  );

  if (!isInteractive) {
    return (
      <View
        accessibilityRole="image"
        accessibilityLabel={`ランナー状況: ${caption}`}
      >
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          {diamond}
          <Text style={styles.caption}>{caption}</Text>
        </View>
      </View>
    );
  }

  return (
    <View accessibilityLabel="ランナー状況">
      {diamond}
      <Text accessibilityLiveRegion="polite" style={styles.caption}>
        {caption}
      </Text>
      {value !== null ? (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="未入力に戻す"
          onPress={() => onChange?.(null)}
          style={styles.resetButton}
        >
          <Text style={styles.resetText}>未入力に戻す</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  diamond: {
    alignSelf: "center",
    width: 152,
    height: 132,
  },
  baseTouchable: {
    position: "absolute",
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  baseMarker: {
    width: 28,
    height: 28,
    borderRadius: 3,
    borderWidth: 2,
    transform: [{ rotate: "45deg" }],
    alignItems: "center",
    justifyContent: "center",
  },
  baseOn: {
    backgroundColor: "#d08000",
    borderColor: "#d08000",
  },
  baseOff: {
    backgroundColor: "transparent",
    borderColor: "#71717a",
  },
  baseInnerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FFFFFF",
  },
  homePlate: {
    position: "absolute",
    bottom: 0,
    left: 65,
  },
  caption: {
    marginTop: 4,
    textAlign: "center",
    color: "#A1A1AA",
    fontSize: 12,
  },
  resetButton: {
    alignSelf: "center",
    marginTop: 4,
    padding: 4,
  },
  resetText: {
    color: "#A1A1AA",
    fontSize: 12,
    textDecorationLine: "underline",
  },
});

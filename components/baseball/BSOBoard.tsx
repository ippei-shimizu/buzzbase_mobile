import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export type BSOKey = "balls" | "strikes" | "outs";

interface Props {
  balls: number | null;
  strikes: number | null;
  outs: number | null;
  /** 未指定なら表示専用モード（支援技術にはラベル文字列のみを公開する）。 */
  onChange?: (key: BSOKey, value: number | null) => void;
}

interface RowConfig {
  key: BSOKey;
  label: string;
  /** 取りうる値の最大（ボール=3 / ストライク=2 / アウト=2）。 */
  max: number;
  /** 点灯色（球場のカウントボード配色: ボール=緑 / ストライク=黄 / アウト=赤）。 */
  color: string;
}

const ROWS: RowConfig[] = [
  { key: "balls", label: "ボール", max: 3, color: "#22c55e" },
  { key: "strikes", label: "ストライク", max: 2, color: "#eab308" },
  { key: "outs", label: "アウト", max: 2, color: "#ef4444" },
];

/**
 * 球場カウントボード風の BSO ドット表示。
 * onChange 指定時は入力モード（ドットタップで値変更、点灯済み最後尾の再タップで 1 段下げ）、
 * 未指定時は表示専用（null は消灯のまま描画）として振る舞う。
 */
export function BSOBoard({ balls, strikes, outs, onChange }: Props) {
  const values: Record<BSOKey, number | null> = { balls, strikes, outs };
  const isInteractive = onChange !== undefined;

  const board = (
    <View style={styles.board}>
      {ROWS.map((row) => {
        const value = values[row.key];
        const dots = Array.from({ length: row.max }, (_, index) => index + 1);
        return (
          <View key={row.key} style={styles.row}>
            <Text style={styles.rowLabel}>{row.label}</Text>
            <View style={styles.dotRow}>
              {dots.map((dotIndex) => {
                const isOn = value !== null && value >= dotIndex;
                const dot = (
                  <View
                    style={[
                      styles.dot,
                      isOn
                        ? { backgroundColor: row.color, borderColor: row.color }
                        : styles.dotOff,
                    ]}
                  />
                );
                return isInteractive ? (
                  <TouchableOpacity
                    key={dotIndex}
                    accessibilityRole="button"
                    accessibilityLabel={`${row.label} ${dotIndex}`}
                    accessibilityState={{ selected: isOn }}
                    hitSlop={6}
                    onPress={() => {
                      // 点灯済みの最後のドット再タップ → 1 段下げる（0 になったら null）。
                      if (value === dotIndex) {
                        onChange?.(row.key, dotIndex === 1 ? null : dotIndex - 1);
                      } else {
                        onChange?.(row.key, dotIndex);
                      }
                    }}
                  >
                    {dot}
                  </TouchableOpacity>
                ) : (
                  <View key={dotIndex}>{dot}</View>
                );
              })}
            </View>
          </View>
        );
      })}
    </View>
  );

  if (!isInteractive) {
    const describe = (value: number | null) =>
      value === null ? "未記録" : String(value);
    return (
      <View
        accessibilityRole="image"
        accessibilityLabel={`カウント ボール${describe(balls)} ストライク${describe(strikes)} アウト${describe(outs)}`}
      >
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          {board}
        </View>
      </View>
    );
  }

  return board;
}

const styles = StyleSheet.create({
  board: {
    backgroundColor: "#1c1c1c",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowLabel: {
    color: "#F4F4F4",
    fontSize: 13,
    fontWeight: "bold",
    width: 80,
  },
  dotRow: {
    flexDirection: "row",
    gap: 12,
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
  },
  dotOff: {
    backgroundColor: "transparent",
    borderColor: "#5a5a5a",
  },
});

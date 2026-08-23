import React from "react";
import { StyleSheet, Text, View } from "react-native";

/**
 * 打席詳細画面の 1 行（ラベル + 値）。未記録の表示ルールをここに集約する。
 * - null / 空文字は「未記録」をグレーで表示する
 * - `0` は未記録ではない（打点 0 は `0` のまま表示する）
 * - 行ごと出し分けたい条件付き項目は、呼び出し側で行自体を描画しない
 */
export function DetailRow({
  label,
  value,
  children,
}: {
  label: string;
  value?: string | number | null;
  children?: React.ReactNode;
}) {
  const isUnrecorded =
    children === undefined &&
    (value === null || value === undefined || value === "");
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      {children !== undefined ? (
        <View style={styles.content}>{children}</View>
      ) : isUnrecorded ? (
        <Text style={styles.unrecorded}>未記録</Text>
      ) : (
        <Text style={styles.value}>{value}</Text>
      )}
    </View>
  );
}

/** BSO ボード・ダイヤモンド等、消灯描画の上に重ねる「未記録」バッジ。 */
export function UnrecordedBadgeOverlay({
  isUnrecorded,
  children,
}: {
  isUnrecorded: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.overlayContainer}>
      {children}
      {isUnrecorded ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>未記録</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#3F3F46",
  },
  label: {
    color: "#A1A1AA",
    fontSize: 13,
    flexShrink: 0,
  },
  content: {
    flex: 1,
    alignItems: "flex-end",
  },
  value: {
    color: "#F4F4F4",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "right",
    flexShrink: 1,
  },
  unrecorded: {
    color: "#71717A",
    fontSize: 13,
  },
  overlayContainer: {
    position: "relative",
    width: "100%",
  },
  badge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#3F3F46",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    color: "#D4D4D8",
    fontSize: 11,
  },
});

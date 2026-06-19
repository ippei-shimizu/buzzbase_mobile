import React from "react";
import { StyleSheet, Text, View } from "react-native";

/**
 * Pro プラン Coming soon カードのボカし対象ダミー body 群。
 * 数値はすべてダミー固定値で、BlurView で読み取れなくなる前提のため正確さは不要。
 * 各機能のレイアウトに似せて「何ができる機能か」を視覚的に伝える役割を持つ。
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

export function PitchTypeDummy() {
  const rows = [
    { label: "ストレート", average: ".342" },
    { label: "スライダー", average: ".289" },
    { label: "カーブ", average: ".200" },
  ];
  return (
    <View style={styles.listWrapper}>
      {rows.map((row) => (
        <View key={row.label} style={styles.listRow}>
          <Text style={styles.listLabel}>{row.label}</Text>
          <Text style={styles.listAverage}>{row.average}</Text>
        </View>
      ))}
    </View>
  );
}

export function PitcherFaceoffDummy() {
  const rows = [
    { name: "投手 A", average: ".375" },
    { name: "投手 B", average: ".300" },
    { name: "投手 C", average: ".231" },
  ];
  return (
    <View style={styles.listWrapper}>
      {rows.map((row) => (
        <View key={row.name} style={styles.listRow}>
          <Text style={styles.listLabel}>{row.name}</Text>
          <Text style={styles.listAverage}>{row.average}</Text>
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
  listWrapper: {
    gap: 8,
  },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#27272A",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  listLabel: {
    color: "#F4F4F4",
    fontSize: 13,
    fontWeight: "600",
  },
  listAverage: {
    color: "#d08000",
    fontSize: 18,
    fontWeight: "800",
  },
});

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

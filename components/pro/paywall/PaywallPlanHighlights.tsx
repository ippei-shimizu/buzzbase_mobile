import type { IconName } from "../../../types/icon";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Icon } from "@components/icon/Icon";

interface Highlight {
  icon: IconName;
  label: string;
}

/**
 * プランを選ぶ直前に「何が付いてくるか」を思い出すための一覧。
 * 価値画面より短い語で、打席データの分析から記録を続ける機能までの幅を見せる。
 */
const HIGHLIGHTS: readonly Highlight[] = [
  { icon: "remove-circle", label: "広告なし" },
  { icon: "baseball", label: "方向別打率" },
  { icon: "square-outline", label: "コース別打率" },
  { icon: "person-outline", label: "対戦投手別成績" },
  { icon: "trending-up", label: "シーズン比較" },
  { icon: "videocam", label: "動画が無制限" },
  { icon: "document-text-outline", label: "週次・月次レポート" },
  { icon: "flag-outline", label: "目標が無制限" },
  { icon: "people-outline", label: "グループが無制限" },
];

/**
 * プラン画面でプランと復元導線の間に置く機能ハイライト。
 * どちらのプランを選んでも使える機能なので、プランごとの出し分けはしない。
 */
export function PaywallPlanHighlights() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>どちらのプランでも使えます</Text>
      <View style={styles.grid}>
        {HIGHLIGHTS.map(({ icon, label }) => (
          <View key={label} style={styles.item} accessibilityLabel={label}>
            <View style={styles.iconCircle}>
              <Icon name={icon} size={22} color="#d08000" />
            </View>
            <Text style={styles.itemLabel}>{label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: 16,
    marginBottom: 20,
  },
  title: {
    color: "#F4F4F4",
    fontSize: 18,
    fontWeight: "800",
    lineHeight: 26,
    textAlign: "center",
    marginBottom: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 18,
  },
  // 3 列に固定して、ラベルの長さが違っても行の頭が揃うようにする。
  item: {
    width: "33.33%",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 4,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(208, 128, 0, 0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  itemLabel: {
    color: "#D4D4D4",
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});

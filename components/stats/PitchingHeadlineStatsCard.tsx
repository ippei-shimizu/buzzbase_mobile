import type { PitchingSummary } from "../../types/stats";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { formatEra } from "@utils/formatStats";

interface PitchingHeadlineStatsCardProps {
  data: PitchingSummary | undefined;
}

interface MetricItem {
  label: string;
  value: string;
}

const buildMetrics = (
  data: PitchingSummary,
): { primary: MetricItem[]; secondary: MetricItem[] } => ({
  primary: [
    { label: "防御率", value: formatEra(data.era) },
    { label: "WHIP", value: formatEra(data.whip) },
    { label: "K/9", value: formatEra(data.k_per_nine) },
    { label: "K/BB", value: formatEra(data.k_bb) },
  ],
  secondary: [
    { label: "登板", value: String(data.appearances) },
    { label: "勝敗", value: `${data.win}勝${data.loss}敗` },
    { label: "奪三振", value: String(data.strikeouts) },
  ],
});

/**
 * stats タブ投球セクションの最上部に置く主要スタッツカード。
 * 上段: 率指標（防御率 / WHIP / K/9 / K/BB）、下段: 累計指標（登板 / 勝敗 / 奪三振）。
 * 投球回は丸める前の合計を小数 2 桁でヘッダに出す。投球成績テーブルは back が小数 1 桁に丸めるため
 * 14⅓ 回がテーブルでは 14.30、カードでは 14.33 と表示される。
 */
export function PitchingHeadlineStatsCard({
  data,
}: PitchingHeadlineStatsCardProps) {
  if (!data) return null;
  const metrics = buildMetrics(data);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>主要スタッツ</Text>
        <Text style={styles.subtitle}>
          {formatEra(data.innings_pitched)} 投球回
        </Text>
      </View>

      <View style={styles.row}>
        {metrics.primary.map((metric) => (
          <View key={metric.label} style={styles.metricCell}>
            <Text style={styles.metricValue}>{metric.value}</Text>
            <Text style={styles.metricLabel}>{metric.label}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.row, styles.secondaryRow]}>
        {metrics.secondary.map((metric) => (
          <View key={metric.label} style={styles.metricCell}>
            <Text style={styles.secondaryValue}>{metric.value}</Text>
            <Text style={styles.metricLabel}>{metric.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#27272a",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    color: "#F4F4F4",
    fontSize: 14,
    fontWeight: "700",
  },
  subtitle: {
    color: "#A1A1AA",
    fontSize: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  secondaryRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#3a3a3a",
  },
  metricCell: {
    flex: 1,
    alignItems: "center",
  },
  metricValue: {
    color: "#F4F4F4",
    fontSize: 22,
    fontWeight: "700",
  },
  secondaryValue: {
    color: "#F4F4F4",
    fontSize: 20,
    fontWeight: "700",
  },
  metricLabel: {
    color: "#A1A1AA",
    fontSize: 11,
    marginTop: 2,
  },
});

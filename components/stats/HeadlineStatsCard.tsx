import type { HeadlineStats } from "../../types/stats";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface HeadlineStatsCardProps {
  data: HeadlineStats | undefined;
}

interface MetricItem {
  label: string;
  value: string;
}

/** 打率 / OBP / SLG / OPS は小数 3 桁、先頭の 0 を省略して ".XXX" で表示する。 */
const formatRate = (value: number): string => {
  if (!Number.isFinite(value)) return ".000";
  return value.toFixed(3).replace(/^0/, "");
};

const formatCount = (value: number): string => String(value);

const buildMetrics = (
  data: HeadlineStats,
): { primary: MetricItem[]; secondary: MetricItem[] } => ({
  primary: [
    { label: "打率", value: formatRate(data.batting_average) },
    { label: "出塁率", value: formatRate(data.on_base_percentage) },
    { label: "長打率", value: formatRate(data.slugging_percentage) },
    { label: "OPS", value: formatRate(data.ops) },
  ],
  secondary: [
    { label: "安打", value: formatCount(data.hit) },
    { label: "本塁打", value: formatCount(data.home_run) },
    { label: "打点", value: formatCount(data.runs_batted_in) },
  ],
});

/**
 * stats タブ打撃セクションの最上部に置く主要スタッツカード。
 * 上段: 率指標（打率 / 出塁率 / 長打率 / OPS）、下段: 累計指標（安打 / 本塁打 / 打点）。
 * 母数 0 のときも 0.000 / 0 を表示するが、見出し直下の at_bats が「0 打数」になるので
 * カードヘッダのサブタイトルとして表示する。
 */
export function HeadlineStatsCard({ data }: HeadlineStatsCardProps) {
  if (!data) return null;
  const metrics = buildMetrics(data);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>主要スタッツ</Text>
        <Text style={styles.subtitle}>{data.at_bats} 打数</Text>
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

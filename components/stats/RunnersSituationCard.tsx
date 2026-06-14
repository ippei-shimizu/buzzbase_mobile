import type { RunnersSituationSummary } from "../../types/stats";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface RunnersSituationCardProps {
  data: RunnersSituationSummary | undefined;
}

const formatBattingAverage = (value: number, atBats: number): string => {
  if (atBats === 0) return "-";
  if (!Number.isFinite(value)) return ".000";
  return value.toFixed(3).replace(/^0/, "");
};

/**
 * 得点圏（runners_state IN 2..7）打率カード。
 * 母数 0（runners_state を持つ新仕様 PA がまだ無いケース）は「対象データなし」表示に分岐し、
 * 旧データのみのユーザーで違和感が出ないようにする。
 */
export function RunnersSituationCard({ data }: RunnersSituationCardProps) {
  if (!data) return null;
  const hasData = data.at_bats > 0;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>得点圏打率</Text>

      {hasData ? (
        <>
          <Text style={styles.bigAverage}>
            {formatBattingAverage(data.batting_average, data.at_bats)}
          </Text>
          <Text style={styles.subline}>
            {data.at_bats} 打数 {data.hits} 安打
          </Text>
          <View style={styles.chipsRow}>
            <View style={styles.chip}>
              <Text style={styles.chipLabel}>二塁打</Text>
              <Text style={styles.chipValue}>{data.two_base_hit}</Text>
            </View>
            <View style={styles.chip}>
              <Text style={styles.chipLabel}>三塁打</Text>
              <Text style={styles.chipValue}>{data.three_base_hit}</Text>
            </View>
            <View style={styles.chip}>
              <Text style={styles.chipLabel}>本塁打</Text>
              <Text style={styles.chipValue}>{data.home_run}</Text>
            </View>
          </View>
        </>
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>対象データがありません</Text>
          <Text style={styles.emptyHint}>
            新仕様で記録した試合（ランナー状況付き）が対象です
          </Text>
        </View>
      )}
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
  title: {
    color: "#F4F4F4",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
  },
  bigAverage: {
    color: "#F4F4F4",
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginVertical: 4,
  },
  subline: {
    color: "#A1A1AA",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 12,
  },
  chipsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  chip: {
    flex: 1,
    backgroundColor: "#424242",
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
  },
  chipLabel: {
    color: "#A1A1AA",
    fontSize: 11,
  },
  chipValue: {
    color: "#F4F4F4",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 2,
  },
  empty: {
    alignItems: "center",
    paddingVertical: 20,
  },
  emptyText: {
    color: "#A1A1AA",
    fontSize: 13,
    marginBottom: 4,
  },
  emptyHint: {
    color: "#71717A",
    fontSize: 11,
    textAlign: "center",
  },
});

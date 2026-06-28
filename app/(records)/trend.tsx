import type { MenuTrend, MenuTrendBucket } from "../../types/practice";
import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { UnderlineTabBar } from "@components/ui/UnderlineTabBar";
import { formatTotalAmount, formatVolume } from "@constants/practice";
import { useMenuTrend } from "@hooks/usePracticeSummaries";

type Period = "year" | "month" | "day";
const SEGMENTS = ["年別", "月別", "日別"];
const PERIODS: Period[] = ["year", "month", "day"];

const bucketValue = (trend: MenuTrend, bucket: MenuTrendBucket): number =>
  trend.menu.is_weight_reps ? bucket.total_volume : bucket.total_amount;

const bucketValueText = (trend: MenuTrend, bucket: MenuTrendBucket): string =>
  trend.menu.is_weight_reps
    ? formatVolume(bucket.total_volume)
    : formatTotalAmount(bucket.total_amount, trend.menu.unit_label);

// "2026" / "2026-06" / "2026-06-27" を表示ラベルへ。
const periodLabel = (period: Period, value: string): string => {
  const parts = value.split("-").map(Number);
  if (period === "year") return `${parts[0]}年`;
  if (period === "month") return `${parts[0]}/${parts[1]}`;
  return `${parts[1]}/${parts[2]}`;
};

function TrendBars({
  trend,
  period,
  buckets,
}: {
  trend: MenuTrend;
  period: Period;
  buckets: MenuTrendBucket[];
}) {
  const limit = period === "day" ? 14 : period === "month" ? 12 : 6;
  const shown = buckets.slice(0, limit).reverse(); // 古い→新しい
  const max = Math.max(...shown.map((b) => bucketValue(trend, b)), 1);

  if (shown.length === 0) return null;

  return (
    <View style={styles.barsRow}>
      {shown.map((bucket) => {
        const value = bucketValue(trend, bucket);
        const ratio = value / max;
        return (
          <View key={bucket.period} style={styles.barCol}>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  { height: `${Math.max(ratio * 100, value > 0 ? 4 : 0)}%` },
                ]}
              />
            </View>
            <Text style={styles.barLabel} numberOfLines={1}>
              {periodLabel(period, bucket.period)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

export default function MenuTrendScreen() {
  const { menuId } = useLocalSearchParams<{ menuId: string }>();
  const { trend, isLoading } = useMenuTrend(menuId ? Number(menuId) : null);
  const [segment, setSegment] = useState(1); // 既定: 月別

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#d08000" />
      </View>
    );
  }
  if (!trend) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>データが見つかりません</Text>
      </View>
    );
  }

  const period = PERIODS[segment];
  const buckets =
    (period === "year"
      ? trend.by_year
      : period === "month"
        ? trend.by_month
        : trend.by_day) ?? [];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{trend.menu.name}</Text>

        <View style={styles.tabWrap}>
          <UnderlineTabBar
            options={SEGMENTS}
            selectedIndex={segment}
            onSelect={setSegment}
          />
        </View>

        {buckets.length === 0 ? (
          <Text style={styles.muted}>記録がありません</Text>
        ) : (
          <>
            <View style={styles.card}>
              <TrendBars trend={trend} period={period} buckets={buckets} />
            </View>
            <View style={styles.listCard}>
              {buckets.map((bucket) => (
                <View key={bucket.period} style={styles.row}>
                  <Text style={styles.rowLabel}>
                    {periodLabel(period, bucket.period)}
                  </Text>
                  <View style={styles.rowRight}>
                    <Text style={styles.rowValue}>
                      {bucketValueText(trend, bucket)}
                    </Text>
                    {period !== "day" ? (
                      <Text style={styles.rowSub}>{bucket.days_count}日</Text>
                    ) : null}
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#2E2E2E" },
  content: { padding: 16, paddingBottom: 40 },
  centered: {
    flex: 1,
    backgroundColor: "#2E2E2E",
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: { color: "#A1A1AA", fontSize: 15 },
  title: { color: "#F4F4F4", fontSize: 20, fontWeight: "700" },
  tabWrap: { marginTop: 16, marginBottom: 4 },
  muted: { color: "#A1A1AA", fontSize: 13, marginTop: 24, textAlign: "center" },
  card: {
    backgroundColor: "#3A3A3A",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  barsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 140,
    gap: 4,
  },
  barCol: { flex: 1, alignItems: "center", height: "100%" },
  barTrack: {
    flex: 1,
    width: 16,
    backgroundColor: "#2E2E2E",
    borderRadius: 4,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  barFill: { width: "100%", backgroundColor: "#d08000", borderRadius: 4 },
  barLabel: { color: "#A1A1AA", fontSize: 10, marginTop: 6 },
  listCard: {
    backgroundColor: "#3A3A3A",
    borderRadius: 12,
    paddingHorizontal: 14,
    marginTop: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2E2E2E",
  },
  rowLabel: { color: "#F4F4F4", fontSize: 14, fontWeight: "600" },
  rowRight: { flexDirection: "row", alignItems: "baseline", gap: 8 },
  rowValue: { color: "#d08000", fontSize: 16, fontWeight: "800" },
  rowSub: { color: "#A1A1AA", fontSize: 12 },
});

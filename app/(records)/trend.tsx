import type { MenuTrend, MenuTrendMonth } from "../../types/practice";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { formatTotalAmount, formatVolume } from "@constants/practice";
import { useMenuTrend } from "@hooks/usePracticeSummaries";

const monthValue = (trend: MenuTrend, month: MenuTrendMonth): number =>
  trend.menu.is_weight_reps ? month.total_volume : month.total_amount;

const monthValueText = (trend: MenuTrend, month: MenuTrendMonth): string => {
  if (trend.menu.is_weight_reps) return formatVolume(month.total_volume);
  return formatTotalAmount(month.total_amount, trend.menu.unit_label);
};

const formatMd = (iso: string): string => {
  const [, month, day] = iso.split("-").map(Number);
  return `${month}/${day}`;
};

function TrendBars({ trend }: { trend: MenuTrend }) {
  const max = Math.max(...trend.monthly.map((m) => monthValue(trend, m)), 1);

  return (
    <View style={styles.barsCard}>
      <Text style={styles.cardTitle}>
        月次推移（{trend.menu.is_weight_reps ? "総挙上重量" : "合計"}）
      </Text>
      <View style={styles.barsRow}>
        {trend.monthly.map((month) => {
          const value = monthValue(trend, month);
          const ratio = value / max;
          return (
            <View key={month.month} style={styles.barCol}>
              <Text style={styles.barValue} numberOfLines={1}>
                {value > 0 ? monthValueText(trend, month) : ""}
              </Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    { height: `${Math.max(ratio * 100, value > 0 ? 4 : 0)}%` },
                  ]}
                />
              </View>
              <Text style={styles.barLabel}>
                {Number(month.month.slice(5))}月
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default function MenuTrendScreen() {
  const { menuId } = useLocalSearchParams<{ menuId: string }>();
  const { trend, isLoading } = useMenuTrend(menuId ? Number(menuId) : null);

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

  const best = trend.menu.is_weight_reps
    ? trend.best.max_weight != null
      ? `${Number(trend.best.max_weight)}kg`
      : "-"
    : trend.best.max_amount != null
      ? formatTotalAmount(trend.best.max_amount, trend.menu.unit_label)
      : "-";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{trend.menu.name}</Text>

      <View style={styles.bestCard}>
        <Text style={styles.bestLabel}>
          {trend.menu.is_weight_reps ? "自己ベスト（最大重量）" : "自己ベスト"}
        </Text>
        <Text style={styles.bestValue}>{best}</Text>
      </View>

      <TrendBars trend={trend} />

      <Text style={styles.sectionTitle}>最近の記録</Text>
      {trend.recent.length === 0 ? (
        <Text style={styles.muted}>記録がありません</Text>
      ) : (
        <View style={styles.recentCard}>
          {trend.recent.map((log) => (
            <View key={log.id} style={styles.recentRow}>
              <Text style={styles.recentDate}>{formatMd(log.logged_on)}</Text>
              <Text style={styles.recentValue}>
                {log.weight != null
                  ? `${Number(log.weight)}kg × ${Number(log.amount ?? 0)}回`
                  : formatTotalAmount(log.amount ?? 0, trend.menu.unit_label)}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
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
  bestCard: {
    backgroundColor: "#3A3A3A",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    alignItems: "center",
  },
  bestLabel: { color: "#A1A1AA", fontSize: 12, fontWeight: "600" },
  bestValue: {
    color: "#d08000",
    fontSize: 28,
    fontWeight: "800",
    marginTop: 4,
  },
  barsCard: {
    backgroundColor: "#3A3A3A",
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  cardTitle: {
    color: "#A1A1AA",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 12,
  },
  barsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 140,
  },
  barCol: { flex: 1, alignItems: "center", height: "100%" },
  barValue: { color: "#A1A1AA", fontSize: 9, marginBottom: 4 },
  barTrack: {
    flex: 1,
    width: 18,
    backgroundColor: "#2E2E2E",
    borderRadius: 4,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  barFill: {
    width: "100%",
    backgroundColor: "#d08000",
    borderRadius: 4,
  },
  barLabel: { color: "#A1A1AA", fontSize: 11, marginTop: 6 },
  sectionTitle: {
    color: "#F4F4F4",
    fontSize: 15,
    fontWeight: "700",
    marginTop: 24,
    marginBottom: 10,
  },
  muted: { color: "#A1A1AA", fontSize: 13 },
  recentCard: {
    backgroundColor: "#3A3A3A",
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  recentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2E2E2E",
  },
  recentDate: { color: "#A1A1AA", fontSize: 13 },
  recentValue: { color: "#F4F4F4", fontSize: 14, fontWeight: "600" },
});

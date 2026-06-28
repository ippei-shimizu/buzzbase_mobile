import type { MenuSummary } from "../../types/practice";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { formatTotalAmount, formatVolume } from "@constants/practice";
import { usePracticeSummaries } from "@hooks/usePracticeSummaries";

const formatMd = (iso: string | null): string => {
  if (!iso) return "-";
  const [, month, day] = iso.split("-").map(Number);
  return `${month}/${day}`;
};

const isWeightReps = (summary: MenuSummary): boolean =>
  summary.unit === "weight_reps" || summary.total_volume != null;

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.tile}>
      <Text style={styles.tileLabel}>{label}</Text>
      <Text style={styles.tileValue}>{value}</Text>
    </View>
  );
}

function SummaryCard({ summary }: { summary: MenuSummary }) {
  const weightReps = isWeightReps(summary);
  const totalText = weightReps
    ? formatVolume(summary.total_volume ?? 0)
    : formatTotalAmount(summary.total_amount, summary.unit_label);
  const monthText = weightReps
    ? formatVolume(summary.this_month_volume ?? 0)
    : formatTotalAmount(summary.this_month_amount, summary.unit_label);

  return (
    <View style={styles.card}>
      <View style={styles.cardHead}>
        <Ionicons
          name={weightReps ? "barbell" : "fitness"}
          size={18}
          color="#d08000"
        />
        <Text style={styles.menuName}>{summary.menu_name}</Text>
      </View>
      <View style={styles.tileRow}>
        <StatTile
          label={weightReps ? "総挙上重量" : "累計"}
          value={totalText}
        />
        <StatTile label="今月" value={monthText} />
      </View>
      {weightReps ? (
        <Text style={styles.meta}>
          累計 {Number(summary.total_amount).toLocaleString()}回 ・ 記録{" "}
          {summary.days_count}日 ・ 最終 {formatMd(summary.last_logged_on)}
        </Text>
      ) : (
        <Text style={styles.meta}>
          記録 {summary.days_count}日 ・ 最終 {formatMd(summary.last_logged_on)}
        </Text>
      )}
    </View>
  );
}

export default function PracticeSummaryScreen() {
  const { summaries, isLoading } = usePracticeSummaries();

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#d08000" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.lead}>
        これまでメニューごとに積み上げてきた記録です。
      </Text>
      {summaries.length === 0 ? (
        <Text style={styles.empty}>まだ練習記録がありません</Text>
      ) : (
        summaries.map((summary) => (
          <SummaryCard
            key={summary.practice_menu_id ?? summary.menu_name}
            summary={summary}
          />
        ))
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
  lead: { color: "#A1A1AA", fontSize: 13, marginBottom: 16 },
  empty: { color: "#A1A1AA", fontSize: 14, textAlign: "center", marginTop: 40 },
  card: {
    backgroundColor: "#3A3A3A",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  cardHead: { flexDirection: "row", alignItems: "center", gap: 8 },
  menuName: { color: "#F4F4F4", fontSize: 15, fontWeight: "700" },
  tileRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  tile: {
    flex: 1,
    backgroundColor: "#2E2E2E",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  tileLabel: { color: "#A1A1AA", fontSize: 11, fontWeight: "600" },
  tileValue: {
    color: "#d08000",
    fontSize: 20,
    fontWeight: "800",
    marginTop: 4,
  },
  meta: { color: "#A1A1AA", fontSize: 12, marginTop: 10 },
});

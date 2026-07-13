import type { MenuSummary } from "../../../types/practice";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { formatTotalAmount, formatVolume } from "@constants/practice";
import { usePracticeSummaries } from "@hooks/usePracticeSummaries";
import { SectionCard } from "./SectionCard";

const isWeightReps = (summary: MenuSummary): boolean =>
  summary.unit === "weight_reps" || summary.this_month_volume != null;

const monthValue = (summary: MenuSummary): number =>
  isWeightReps(summary)
    ? (summary.this_month_volume ?? 0)
    : summary.this_month_amount;

const monthText = (summary: MenuSummary): string =>
  isWeightReps(summary)
    ? formatVolume(summary.this_month_volume ?? 0)
    : formatTotalAmount(summary.this_month_amount, summary.unit_label);

/** 今月のメニュー別積み上げハイライト（上位3件）。今月の記録が無ければ非表示。 */
export function MonthlySummarySection() {
  const router = useRouter();
  const { summaries } = usePracticeSummaries();

  const top = summaries
    .filter((summary) => monthValue(summary) > 0)
    .sort((a, b) => monthValue(b) - monthValue(a))
    .slice(0, 3);

  if (top.length === 0) return null;

  return (
    <SectionCard title="今月の積み上げ">
      {top.map((summary) => (
        <View
          key={summary.practice_menu_id ?? summary.menu_name}
          style={styles.row}
        >
          <Text style={styles.name} numberOfLines={1}>
            {summary.menu_name}
          </Text>
          <Text style={styles.value}>{monthText(summary)}</Text>
        </View>
      ))}
      <TouchableOpacity
        style={styles.moreRow}
        onPress={() => router.push("/(records)/summary")}
      >
        <Text style={styles.moreText}>メニュー別の積み上げを見る</Text>
        <Ionicons name="chevron-forward" size={16} color="#d08000" />
      </TouchableOpacity>
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  name: { color: "#F4F4F4", fontSize: 14, flex: 1, marginRight: 12 },
  value: { color: "#d08000", fontSize: 15, fontWeight: "800" },
  moreRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingTop: 12,
  },
  moreText: { color: "#d08000", fontSize: 13, fontWeight: "600" },
});

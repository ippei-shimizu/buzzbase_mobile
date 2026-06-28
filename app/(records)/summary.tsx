import type { MenuSummary } from "../../types/practice";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { formatTotalAmount, formatVolume } from "@constants/practice";
import { useStreak } from "@hooks/useActivity";
import {
  usePracticeOverview,
  usePracticeSummaries,
} from "@hooks/usePracticeSummaries";

const formatMd = (iso: string | null): string => {
  if (!iso) return "-";
  const [, month, day] = iso.split("-").map(Number);
  return `${month}/${day}`;
};

const isWeightReps = (summary: MenuSummary): boolean =>
  summary.unit === "weight_reps" || summary.total_volume != null;

function KpiTile({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.kpiTile}>
      <Text style={styles.kpiValue}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
    </View>
  );
}

function OverallHeader() {
  const { overview } = usePracticeOverview();
  const { streak } = useStreak();
  if (!overview) return null;

  return (
    <View style={styles.kpiCard}>
      <View style={styles.kpiRow}>
        <KpiTile label="連続" value={`${streak?.current_streak_days ?? 0}日`} />
        <KpiTile label="練習日数" value={`${overview.total_practice_days}日`} />
        <KpiTile
          label="今月"
          value={`${overview.this_month_practice_days}日`}
        />
      </View>
      <View style={styles.kpiRow}>
        <KpiTile
          label="総素振り"
          value={`${overview.total_swing_count.toLocaleString()}本`}
        />
        {overview.total_volume > 0 ? (
          <KpiTile
            label="総挙上重量"
            value={formatVolume(overview.total_volume)}
          />
        ) : null}
        <KpiTile label="メニュー" value={`${overview.total_menus}`} />
      </View>
    </View>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.tile}>
      <Text style={styles.tileLabel}>{label}</Text>
      <Text style={styles.tileValue}>{value}</Text>
    </View>
  );
}

function SummaryCard({
  summary,
  onPress,
}: {
  summary: MenuSummary;
  onPress?: () => void;
}) {
  const weightReps = isWeightReps(summary);
  const totalText = weightReps
    ? formatVolume(summary.total_volume ?? 0)
    : formatTotalAmount(summary.total_amount, summary.unit_label);
  const monthText = weightReps
    ? formatVolume(summary.this_month_volume ?? 0)
    : formatTotalAmount(summary.this_month_amount, summary.unit_label);

  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Wrapper style={styles.card} onPress={onPress}>
      <View style={styles.cardHead}>
        <View style={styles.cardHeadLeft}>
          <Ionicons
            name={weightReps ? "barbell" : "fitness"}
            size={18}
            color="#d08000"
          />
          <Text style={styles.menuName}>{summary.menu_name}</Text>
        </View>
        {onPress ? (
          <Ionicons name="chevron-forward" size={16} color="#A1A1AA" />
        ) : null}
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
    </Wrapper>
  );
}

export default function PracticeSummaryScreen() {
  const router = useRouter();
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
      <OverallHeader />
      <Text style={styles.lead}>メニューごとの積み上げ</Text>
      {summaries.length === 0 ? (
        <Text style={styles.empty}>まだ練習記録がありません</Text>
      ) : (
        summaries.map((summary) => (
          <SummaryCard
            key={summary.practice_menu_id ?? summary.menu_name}
            summary={summary}
            onPress={
              summary.practice_menu_id != null
                ? () =>
                    router.push({
                      pathname: "/(records)/trend",
                      params: { menuId: String(summary.practice_menu_id) },
                    })
                : undefined
            }
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
  lead: { color: "#A1A1AA", fontSize: 13, marginBottom: 12, fontWeight: "700" },
  empty: { color: "#A1A1AA", fontSize: 14, textAlign: "center", marginTop: 40 },
  kpiCard: {
    backgroundColor: "#3A3A3A",
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    gap: 12,
  },
  kpiRow: { flexDirection: "row", gap: 10 },
  kpiTile: { flex: 1, alignItems: "center" },
  kpiValue: { color: "#d08000", fontSize: 20, fontWeight: "800" },
  kpiLabel: { color: "#A1A1AA", fontSize: 11, fontWeight: "600", marginTop: 2 },
  card: {
    backgroundColor: "#3A3A3A",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  cardHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardHeadLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
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

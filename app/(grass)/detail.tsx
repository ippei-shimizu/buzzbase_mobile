import type { ActivityLog } from "../../types/activity";
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { DayDetailModal } from "@components/grass/DayDetailModal";
import { Heatmap } from "@components/grass/Heatmap";
import { PaywallModal } from "@components/pro/PaywallModal";
import { useActivityHeatmap } from "@hooks/useActivity";
import { useEntitlement } from "@hooks/useEntitlement";
import { addDays, fromIsoDate, toIsoDate, todayIso } from "@utils/planDate";

type ViewMode = "month" | "year";

// back の ActivityLogsController::FREE_WINDOW_DAYS と揃える。
const FREE_WINDOW_DAYS = 30;
const pad = (value: number): string => String(value).padStart(2, "0");

const monthRangeFor = (cursor: string): { from: string; to: string } => {
  const date = fromIsoDate(cursor);
  const year = date.getFullYear();
  const month = date.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return {
    from: `${year}-${pad(month + 1)}-01`,
    to: `${year}-${pad(month + 1)}-${pad(daysInMonth)}`,
  };
};

const yearRangeFor = (cursor: string): { from: string; to: string } => {
  const year = fromIsoDate(cursor).getFullYear();
  return { from: `${year}-01-01`, to: `${year}-12-31` };
};

/** 無料ユーザーが閲覧できる直近30日の範囲に、対象範囲が1日でも重なるか。 */
const overlapsFreeWindow = (range: { from: string; to: string }): boolean => {
  const today = todayIso();
  const lowerBound = addDays(today, -(FREE_WINDOW_DAYS - 1));
  return range.to >= lowerBound && range.from <= today;
};

/**
 * 草ヒートマップの詳細画面。
 * 月別ナビゲーション（F-05）・日付タップ詳細（F-06）・年単位ビュー（F-11, Pro限定）を提供する。
 * ホームの継続ヘッダー（草ミニ）タップから遷移する。
 */
export default function GrassDetailScreen() {
  const { hasEntitlement } = useEntitlement();
  const isPro = hasEntitlement("grass_full_history");
  const [mode, setMode] = useState<ViewMode>("month");
  const [cursor, setCursor] = useState<string>(todayIso());
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{
    date: string;
    log: ActivityLog | null;
  } | null>(null);

  const range = useMemo(
    () => (mode === "year" ? yearRangeFor(cursor) : monthRangeFor(cursor)),
    [mode, cursor],
  );

  const { heatmap, isLoading } = useActivityHeatmap({
    from: range.from,
    to: range.to,
  });

  const selectMode = (nextMode: ViewMode) => {
    if (nextMode === "year" && !isPro) {
      setPaywallOpen(true);
      return;
    }
    setMode(nextMode);
  };

  const shift = (direction: number) => {
    const date = fromIsoDate(cursor);
    const nextCursor =
      mode === "year"
        ? toIsoDate(
            new Date(date.getFullYear() + direction, date.getMonth(), 1),
          )
        : toIsoDate(
            new Date(date.getFullYear(), date.getMonth() + direction, 1),
          );
    const nextRange =
      mode === "year" ? yearRangeFor(nextCursor) : monthRangeFor(nextCursor);

    if (!isPro && !overlapsFreeWindow(nextRange)) {
      setPaywallOpen(true);
      return;
    }
    setCursor(nextCursor);
  };

  const headerTitle = useMemo(() => {
    const date = fromIsoDate(cursor);
    return mode === "year"
      ? `${date.getFullYear()}年`
      : `${date.getFullYear()}年 ${date.getMonth() + 1}月`;
  }, [mode, cursor]);

  const totalActiveDays =
    heatmap?.data.filter((log) => log.intensity_level > 0).length ?? 0;

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <View style={styles.segment}>
          {(["month", "year"] as const).map((value) => {
            const active = mode === value;
            return (
              <TouchableOpacity
                key={value}
                style={[
                  styles.segmentButton,
                  active && styles.segmentButtonActive,
                ]}
                onPress={() => selectMode(value)}
              >
                <Text style={[styles.segmentText, active && styles.textActive]}>
                  {value === "month" ? "月" : "年"}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => shift(-1)}
            hitSlop={10}
            accessibilityLabel={mode === "year" ? "前の年へ" : "前の月へ"}
          >
            <Ionicons name="chevron-back" size={22} color="#F4F4F4" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{headerTitle}</Text>
          <TouchableOpacity
            onPress={() => shift(1)}
            hitSlop={10}
            accessibilityLabel={mode === "year" ? "次の年へ" : "次の月へ"}
          >
            <Ionicons name="chevron-forward" size={22} color="#F4F4F4" />
          </TouchableOpacity>
        </View>

        {mode === "year" ? (
          <Text style={styles.yearTotal}>通算 {totalActiveDays}日</Text>
        ) : null}

        {isLoading ? (
          <ActivityIndicator color="#d08000" style={styles.loading} />
        ) : (
          <Heatmap
            data={heatmap?.data ?? []}
            from={range.from}
            to={range.to}
            showLabels
            scroll={mode === "year"}
            cellSize={mode === "year" ? 10 : 13}
            onCellPress={(cell) => setSelectedCell(cell)}
          />
        )}
      </ScrollView>

      <DayDetailModal
        date={selectedCell?.date ?? null}
        activityLog={selectedCell?.log ?? null}
        onClose={() => setSelectedCell(null)}
      />
      <PaywallModal
        isOpen={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        feature="grass_full_history"
        contextMessage="無料プランは直近30日のみ閲覧できます"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#2E2E2E" },
  container: { flex: 1, backgroundColor: "#2E2E2E" },
  content: { padding: 16, paddingBottom: 40 },
  segment: {
    flexDirection: "row",
    backgroundColor: "#3A3A3A",
    borderRadius: 8,
    padding: 3,
    gap: 3,
    marginBottom: 16,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  segmentButtonActive: { backgroundColor: "#d08000" },
  segmentText: { color: "#A1A1AA", fontSize: 13, fontWeight: "600" },
  textActive: { color: "#FFFFFF" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  headerTitle: { color: "#F4F4F4", fontSize: 17, fontWeight: "700" },
  yearTotal: { color: "#A1A1AA", fontSize: 13, marginBottom: 12 },
  loading: { marginVertical: 40 },
});

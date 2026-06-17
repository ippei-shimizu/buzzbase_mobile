import type { PitchTypeRow } from "../../types/stats";
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { PitcherStatsDetailGrid } from "@components/stats/PitcherStatsDetailGrid";
import { formatBattingAverage } from "@utils/formatBattingAverage";

interface PitchTypeCardProps {
  rows: PitchTypeRow[];
  totalTargetPa: number;
}

const SECTION_LIMIT = 3;

interface InsightRowProps {
  row: PitchTypeRow;
  highlightColor: string;
  isExpanded: boolean;
  onPress: () => void;
}

const InsightRow = ({
  row,
  highlightColor,
  isExpanded,
  onPress,
}: InsightRowProps) => (
  <TouchableOpacity
    style={styles.row}
    activeOpacity={0.7}
    onPress={onPress}
    accessibilityRole="button"
    accessibilityState={{ expanded: isExpanded }}
  >
    <Text style={styles.pitchLabel}>
      {isExpanded ? "▼" : "▶"} {row.label}
    </Text>
    <View style={styles.rowRight}>
      <Text style={[styles.average, { color: highlightColor }]}>
        {formatBattingAverage(row.batting_average, row.at_bats)}
      </Text>
      <Text style={styles.subText}>
        ({row.at_bats}-{row.hits})
      </Text>
    </View>
  </TouchableOpacity>
);

/**
 * 球種別打率カード。
 * 全 10 球種をテーブルで並べる代わりに、打率の高低を「得意 / 苦手」の
 * TOP セクションでハイライトし、0 打数の球種は「その他 N 球種」に集約する
 * インサイト型 UI。打数 1 以上の球種を打率降順で並べ替えて、上位を得意、
 * 下位を苦手にする（同じ行を重複させない）。
 * 各行タップで PitcherFaceoffList と同じ詳細グリッドを展開する。
 */
export const PitchTypeCard = ({ rows, totalTargetPa }: PitchTypeCardProps) => {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (totalTargetPa === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>球種別の打率</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>対象データなし</Text>
          <Text style={styles.emptyNote}>
            新仕様で記録した打席のみが対象です
          </Text>
        </View>
      </View>
    );
  }

  const activeRows = rows.filter((row) => row.at_bats > 0);
  const sortedByAverage = [...activeRows].sort(
    (a, b) => b.batting_average - a.batting_average,
  );

  const goodRows = sortedByAverage.slice(0, SECTION_LIMIT);
  const goodIds = new Set(goodRows.map((row) => row.id));
  const remaining = sortedByAverage.filter((row) => !goodIds.has(row.id));
  const badRowsCandidate = remaining.slice(-SECTION_LIMIT).reverse();

  const showBadSection =
    goodRows.length >= SECTION_LIMIT && badRowsCandidate.length > 0;
  const badRows = showBadSection ? badRowsCandidate : [];

  const zeroCount = rows.length - activeRows.length;

  const renderRow = (row: PitchTypeRow, highlightColor: string) => {
    const isExpanded = expandedId === row.id;
    return (
      <View key={row.id}>
        <InsightRow
          row={row}
          highlightColor={highlightColor}
          isExpanded={isExpanded}
          onPress={() => setExpandedId(isExpanded ? null : row.id)}
        />
        {isExpanded && (
          <View style={styles.detailWrapper}>
            <PitcherStatsDetailGrid
              plateAppearances={row.plate_appearances}
              atBats={row.at_bats}
              hits={row.hits}
              baseOnBalls={row.base_on_balls}
              hitByPitch={row.hit_by_pitch}
              sacrificeFly={row.sacrifice_fly}
              battingAverage={row.batting_average}
              onBasePercentage={row.on_base_percentage}
              sluggingPercentage={row.slugging_percentage}
              ops={row.ops}
              resultCounts={row.result_counts}
            />
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>球種別の打率</Text>
        <Text style={styles.targetCount}>対象 {totalTargetPa} 打席</Text>
      </View>

      {goodRows.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>得意</Text>
          {goodRows.map((row) => renderRow(row, "#d08000"))}
        </View>
      )}

      {badRows.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>苦手</Text>
          {badRows.map((row) => renderRow(row, "#A1A1AA"))}
        </View>
      )}

      {zeroCount > 0 && (
        <Text style={styles.zeroNote}>その他 {zeroCount} 球種（0 打数）</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#3A3A3A",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    color: "#F4F4F4",
    fontSize: 16,
    fontWeight: "700",
  },
  targetCount: {
    color: "#A1A1AA",
    fontSize: 11,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    color: "#A1A1AA",
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: "#27272A",
    borderRadius: 8,
    marginBottom: 4,
  },
  pitchLabel: {
    color: "#F4F4F4",
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },
  average: {
    fontSize: 18,
    fontWeight: "800",
  },
  subText: {
    color: "#71717A",
    fontSize: 11,
  },
  detailWrapper: {
    marginBottom: 6,
  },
  zeroNote: {
    color: "#71717A",
    fontSize: 11,
    textAlign: "center",
    marginTop: 4,
  },
  emptyState: {
    paddingVertical: 32,
    alignItems: "center",
  },
  emptyText: {
    color: "#A1A1AA",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  emptyNote: {
    color: "#71717A",
    fontSize: 11,
  },
});

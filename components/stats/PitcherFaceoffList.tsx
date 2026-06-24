import type { PitcherFaceoff } from "../../types/stats";
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { PitcherStatsDetailGrid } from "@components/stats/PitcherStatsDetailGrid";
import { formatBattingAverage } from "@utils/formatBattingAverage";

interface PitcherFaceoffListProps {
  rows: PitcherFaceoff[];
  minPlateAppearances: number;
  totalTargetPa: number;
}

const formatThrowHand = (
  throwHand: PitcherFaceoff["throw_hand"],
): string | null => {
  if (throwHand === "right") return "右投げ";
  if (throwHand === "left") return "左投げ";
  return null;
};

export const PitcherFaceoffList = ({
  rows,
  minPlateAppearances,
  totalTargetPa,
}: PitcherFaceoffListProps) => {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (rows.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>対戦投手別</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>対戦データなし</Text>
          <Text style={styles.emptyNote}>
            新仕様で記録した {minPlateAppearances} 打席以上の投手が対象です
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>対戦投手別</Text>
        <Text style={styles.targetCount}>
          対戦 {rows.length} 投手 / 対象 {totalTargetPa} 打席（
          {minPlateAppearances} 打席以上のみ）
        </Text>
      </View>

      {rows.map((row) => {
        const isExpanded = expandedId === row.pitcher_id;
        return (
          <View key={row.pitcher_id}>
            <TouchableOpacity
              style={styles.row}
              activeOpacity={0.7}
              onPress={() => setExpandedId(isExpanded ? null : row.pitcher_id)}
              accessibilityRole="button"
              accessibilityState={{ expanded: isExpanded }}
            >
              <View style={styles.leftCol}>
                <Text style={styles.pitcherName} numberOfLines={1}>
                  {isExpanded ? "▼" : "▶"} {row.pitcher_name}
                </Text>
                {(() => {
                  const attributes = [
                    row.team_name,
                    formatThrowHand(row.throw_hand),
                    row.pitcher_style,
                    row.velocity_zone,
                  ].filter(Boolean);
                  return attributes.length > 0 ? (
                    <Text style={styles.subText} numberOfLines={1}>
                      {attributes.join("・")}
                    </Text>
                  ) : null;
                })()}
                <Text style={styles.subText}>{row.plate_appearances}対戦</Text>
              </View>
              <View style={styles.rightCol}>
                <Text style={styles.average}>
                  {formatBattingAverage(row.batting_average, row.at_bats)}
                </Text>
                <Text style={styles.subText}>
                  {row.at_bats}-{row.hits}
                </Text>
              </View>
            </TouchableOpacity>
            {isExpanded && <PitcherFaceoffExpansion row={row} />}
          </View>
        );
      })}
    </View>
  );
};

interface ExpansionProps {
  row: PitcherFaceoff;
}

const PitcherFaceoffExpansion = ({ row }: ExpansionProps) => (
  <View style={styles.expansionWrapper}>
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
);

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
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#27272A",
  },
  leftCol: {
    flex: 1,
  },
  rightCol: {
    alignItems: "flex-end",
  },
  pitcherName: {
    color: "#F4F4F4",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  average: {
    color: "#d08000",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 2,
  },
  subText: {
    color: "#A1A1AA",
    fontSize: 11,
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
    textAlign: "center",
    paddingHorizontal: 16,
  },
  expansionWrapper: {
    marginBottom: 4,
  },
});

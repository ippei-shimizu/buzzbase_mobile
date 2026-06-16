import type { PitcherFaceoff, PitcherResultCount } from "../../types/stats";
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { formatBattingAverage } from "@utils/formatBattingAverage";

interface PitcherFaceoffListProps {
  rows: PitcherFaceoff[];
  minPlateAppearances: number;
  totalTargetPa: number;
}

// plate_result_name で 3 カテゴリにバケットする。サーバーは生の count 列を
// 返すので、フロントで「ヒット / アウト / 四死球」のセマンティクスを持つ。
// マスタ名と照合するため、PlateResult 側の追加 / リネームが発生した時は
// ここを更新する必要がある（CategoryRule で一覧化）。
const HIT_NAMES = new Set(["ヒット", "二塁打", "三塁打", "本塁打"]);
const WALK_NAMES = new Set(["四球", "死球"]);

interface CategorizedCounts {
  hits: number;
  outs: number;
  walks: number;
}

const classifyResults = (counts: PitcherResultCount[]): CategorizedCounts => {
  const initial: CategorizedCounts = { hits: 0, outs: 0, walks: 0 };
  return counts.reduce((acc, c) => {
    if (HIT_NAMES.has(c.plate_result_name)) acc.hits += c.count;
    else if (WALK_NAMES.has(c.plate_result_name)) acc.walks += c.count;
    else acc.outs += c.count;
    return acc;
  }, initial);
};

const CATEGORY_COLORS = {
  hits: "#17C964",
  outs: "#71717A",
  walks: "#d08000",
} as const;

const CATEGORY_LABELS = {
  hits: "ヒット",
  outs: "アウト",
  walks: "四死球",
} as const;

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
                <Text style={styles.subText}>
                  {row.plate_appearances}対戦・主に {row.top_result}
                </Text>
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
            {isExpanded && (
              <PitcherFaceoffExpansion
                counts={classifyResults(row.result_counts)}
                totalPa={row.plate_appearances}
              />
            )}
          </View>
        );
      })}
    </View>
  );
};

interface ExpansionProps {
  counts: CategorizedCounts;
  totalPa: number;
}

const PitcherFaceoffExpansion = ({ counts, totalPa }: ExpansionProps) => {
  const categories = ["hits", "outs", "walks"] as const;
  return (
    <View style={styles.expansion}>
      {categories.map((cat) => {
        const count = counts[cat];
        const pct = totalPa > 0 ? (count / totalPa) * 100 : 0;
        return (
          <View key={cat} style={styles.expansionBarItem}>
            <View style={styles.expansionBarHeader}>
              <View style={styles.expansionLabelRow}>
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: CATEGORY_COLORS[cat] },
                  ]}
                />
                <Text style={styles.expansionLabel}>
                  {CATEGORY_LABELS[cat]}
                </Text>
              </View>
              <Text style={styles.expansionValue}>
                {count} ({pct.toFixed(1)}%)
              </Text>
            </View>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  {
                    width: `${pct}%`,
                    backgroundColor: CATEGORY_COLORS[cat],
                    opacity: count > 0 ? 1 : 0.2,
                  },
                ]}
              />
            </View>
          </View>
        );
      })}
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
  expansion: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 8,
    backgroundColor: "#2E2E2E",
    borderRadius: 8,
    marginBottom: 4,
  },
  expansionBarItem: {
    gap: 3,
  },
  expansionBarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  expansionLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  expansionLabel: {
    color: "#A1A1AA",
    fontSize: 11,
    fontWeight: "600",
  },
  expansionValue: {
    color: "#F4F4F4",
    fontSize: 12,
    fontWeight: "700",
  },
  barTrack: {
    height: 4,
    backgroundColor: "#27272A",
    borderRadius: 2,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 2,
  },
});

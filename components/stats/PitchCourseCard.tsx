import type { StatsFilters } from "../../types/profile";
import type {
  PitchCourseData,
  PitchCoursePitchTypeData,
  PitchCourseZone,
} from "../../types/stats";
import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { PitchCourseGrid } from "@components/stats/PitchCourseGrid";
import { usePitchCoursePitchTypes } from "@hooks/useStats";
import { formatBattingAverage } from "@utils/formatBattingAverage";

interface Props {
  data: PitchCourseData;
  /**
   * 指定時のみ「球種別」タブを表示し、タブを開いたときにだけクロス集計
   * （最大 250 セル）を取得する。ダミー表示（Paywall 用）では未指定にする。
   */
  crossFilters?: StatsFilters;
}

type PitchCourseTab = "course" | "pitch_type";

/**
 * 固定閾値の色スケール。データ内 min/max の相対スケールにすると、フィルタを
 * 変えるたびに同じ打率のセルの色が変わって比較できなくなるため固定にする。
 */
const colorForAverage = (average: number): string => {
  if (average >= 0.45) return "#d64545";
  if (average >= 0.35) return "#d98236";
  if (average >= 0.25) return "#c9a227";
  if (average >= 0.15) return "#4f9e6b";
  return "#4173b3";
};

function ZoneCell({
  zone,
  minAtBats,
}: {
  zone: PitchCourseZone;
  minAtBats: number;
}) {
  if (zone.at_bats === 0) {
    // 打数 0 は色スケールの対象外（無彩色 + "-"）。
    return (
      <View
        style={[
          styles.cell,
          zone.is_strike_zone ? styles.cellStrikeEmpty : styles.cellBallEmpty,
        ]}
      >
        <Text style={styles.cellEmptyText}>-</Text>
      </View>
    );
  }
  const isReliable = zone.at_bats >= minAtBats;
  return (
    <View
      style={[
        styles.cell,
        {
          backgroundColor: colorForAverage(zone.batting_average),
          opacity: isReliable ? 1 : 0.5,
        },
      ]}
    >
      <Text style={styles.cellAverage}>
        {formatBattingAverage(zone.batting_average, zone.at_bats)}
      </Text>
      {isReliable ? null : (
        <Text style={styles.cellAtBats}>({zone.at_bats}打数)</Text>
      )}
    </View>
  );
}

function ZoneHeatmap({
  zones,
  minAtBats,
}: {
  zones: PitchCourseZone[];
  minAtBats: number;
}) {
  const zoneByCourse = new Map(zones.map((zone) => [zone.course, zone]));
  return (
    <View style={styles.heatmapContainer}>
      <PitchCourseGrid
        style={styles.grid}
        renderCell={(course) => {
          const zone = zoneByCourse.get(course);
          return zone ? <ZoneCell zone={zone} minAtBats={minAtBats} /> : null;
        }}
      />
      <View style={styles.horizontalAxis}>
        <Text style={styles.axisLabel}>三塁側</Text>
        <Text style={styles.axisLabel}>真ん中</Text>
        <Text style={styles.axisLabel}>一塁側</Text>
      </View>
    </View>
  );
}

const Notes = () => (
  <View style={styles.notes}>
    <Text style={styles.noteText}>打数が3未満のコースは参考値です</Text>
    <Text style={styles.noteText}>捕手目線で表示しています</Text>
  </View>
);

/**
 * コース別の打率カード（Pro）。コース別 / 球種別の2タブ構成で、
 * 球種別のクロス集計はタブを開いたときにだけ取得する。
 */
export function PitchCourseCard({ data, crossFilters }: Props) {
  const [tab, setTab] = useState<PitchCourseTab>("course");
  const [selectedPitchTypeId, setSelectedPitchTypeId] = useState<number | null>(
    null,
  );
  const showCrossTab = crossFilters !== undefined;
  const cross = usePitchCoursePitchTypes(
    crossFilters ?? {},
    showCrossTab && tab === "pitch_type",
  );

  if (data.total_target_pa === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>コース別の打率</Text>
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>
            詳細記録でコースを入力すると分析が表示されます
          </Text>
          <Text style={styles.emptyHint}>
            試合記録の詳細入力（球種の上）でコースを選べます
          </Text>
        </View>
      </View>
    );
  }

  const crossData: PitchCoursePitchTypeData | undefined = cross.data;
  const selectedRow =
    crossData?.rows.find((row) => row.id === selectedPitchTypeId) ??
    crossData?.rows.find((row) => row.plate_appearances > 0) ??
    crossData?.rows[0];

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>コース別の打率</Text>
        <Text style={styles.targetPa}>対象 {data.total_target_pa} 打席</Text>
      </View>

      {showCrossTab ? (
        <View style={styles.tabRow}>
          {(
            [
              { key: "course", label: "コース別" },
              { key: "pitch_type", label: "球種別" },
            ] as const
          ).map(({ key, label }) => (
            <TouchableOpacity
              key={key}
              accessibilityRole="button"
              accessibilityState={{ selected: tab === key }}
              style={[styles.tabButton, tab === key && styles.tabButtonActive]}
              onPress={() => setTab(key)}
            >
              <Text
                style={[styles.tabLabel, tab === key && styles.tabLabelActive]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}

      {tab === "course" ? (
        <>
          <ZoneHeatmap zones={data.zones} minAtBats={data.min_at_bats} />
          <View style={styles.summaryRow}>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryLabel}>ストライクゾーン</Text>
              <Text style={styles.summaryAverage}>
                {formatBattingAverage(
                  data.strike_zone.batting_average,
                  data.strike_zone.at_bats,
                )}
              </Text>
              <Text style={styles.summaryDetail}>
                ({data.strike_zone.at_bats}-{data.strike_zone.hits})
              </Text>
            </View>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryLabel}>ボールゾーン</Text>
              <Text style={styles.summaryAverage}>
                {formatBattingAverage(
                  data.ball_zone.batting_average,
                  data.ball_zone.at_bats,
                )}
              </Text>
              <Text style={styles.summaryDetail}>
                ({data.ball_zone.at_bats}-{data.ball_zone.hits})
              </Text>
            </View>
          </View>
          <Notes />
        </>
      ) : cross.isLoading ? (
        <View style={styles.crossLoading}>
          <ActivityIndicator color="#d08000" />
        </View>
      ) : !crossData || crossData.rows.length === 0 ? (
        <View style={styles.crossLoading}>
          <Text style={styles.emptyHint}>
            球種別のデータを取得できませんでした
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.chipRow}>
            {crossData.rows.map((row) => {
              const selected = row.id === selectedRow?.id;
              return (
                <TouchableOpacity
                  key={row.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  style={[styles.chip, selected && styles.chipSelected]}
                  onPress={() => setSelectedPitchTypeId(row.id)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selected && styles.chipTextSelected,
                    ]}
                  >
                    {row.label}
                    {row.plate_appearances > 0
                      ? ` (${row.plate_appearances})`
                      : ""}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {selectedRow ? (
            <ZoneHeatmap
              zones={selectedRow.zones}
              minAtBats={crossData.min_at_bats}
            />
          ) : null}
          <Notes />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#3A3A3A",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    color: "#F4F4F4",
    fontSize: 15,
    fontWeight: "bold",
  },
  targetPa: {
    color: "#71717A",
    fontSize: 11,
  },
  tabRow: {
    flexDirection: "row",
    backgroundColor: "#27272A",
    borderRadius: 8,
    padding: 4,
    marginTop: 12,
    gap: 4,
  },
  tabButton: {
    flex: 1,
    borderRadius: 6,
    paddingVertical: 6,
    alignItems: "center",
  },
  tabButtonActive: {
    backgroundColor: "#d08000",
  },
  tabLabel: {
    color: "#A1A1AA",
    fontSize: 12,
    fontWeight: "600",
  },
  tabLabelActive: {
    color: "#FFFFFF",
  },
  heatmapContainer: {
    marginTop: 16,
    alignSelf: "center",
    width: "100%",
    maxWidth: 300,
  },
  grid: {
    height: 280,
  },
  cell: {
    flex: 1,
    borderRadius: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  cellStrikeEmpty: {
    backgroundColor: "#3f3f3f",
  },
  cellBallEmpty: {
    backgroundColor: "#2f2f2f",
  },
  cellEmptyText: {
    color: "#71717A",
    fontSize: 10,
  },
  cellAverage: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "bold",
  },
  cellAtBats: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 9,
  },
  horizontalAxis: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 4,
  },
  axisLabel: {
    color: "#71717A",
    fontSize: 10,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  summaryBox: {
    flex: 1,
    backgroundColor: "#27272A",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  summaryLabel: {
    color: "#A1A1AA",
    fontSize: 11,
  },
  summaryAverage: {
    color: "#F4F4F4",
    fontSize: 18,
    fontWeight: "bold",
  },
  summaryDetail: {
    color: "#71717A",
    fontSize: 11,
  },
  notes: {
    marginTop: 12,
    gap: 2,
  },
  noteText: {
    color: "#71717A",
    fontSize: 11,
  },
  emptyBox: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 6,
  },
  emptyTitle: {
    color: "#A1A1AA",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  emptyHint: {
    color: "#71717A",
    fontSize: 11,
    textAlign: "center",
  },
  crossLoading: {
    alignItems: "center",
    paddingVertical: 32,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 12,
  },
  chip: {
    borderWidth: 1,
    borderColor: "#52525B",
    borderRadius: 14,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  chipSelected: {
    backgroundColor: "#d08000",
    borderColor: "#d08000",
  },
  chipText: {
    color: "#D4D4D8",
    fontSize: 11,
  },
  chipTextSelected: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});

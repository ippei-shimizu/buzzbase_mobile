import type { StatsFilters } from "../../types/profile";
import type {
  PitchCourseData,
  PitchCoursePitchTypeData,
  PitchCourseZone,
  PitchCourseZoneSummary,
  PitcherFaceoffCourseData,
  PitcherFaceoffCourseRow,
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
import { Select } from "@components/ui/Select";
import {
  PITCH_COURSES,
  PITCH_COURSE_BAND_TRACK_FRACTIONS,
  STRIKE_ZONE_COURSES,
} from "@constants/pitchCourse";
import {
  usePitchCoursePitchTypes,
  usePitcherFaceoffCourses,
} from "@hooks/useStats";
import {
  PITCH_COURSE_GRANULARITY_OPTIONS,
  PITCH_COURSE_METRIC_OPTIONS,
  STRIKEOUT_RATE_MIN_PLATE_APPEARANCES,
  computePitchCourseMetric,
  foldPitchCourseZones,
  strikeoutBreakdown,
  sumPitchCourseCounts,
  type PitchCourseCell,
  type PitchCourseGranularity,
  type PitchCourseMetric,
} from "@utils/pitchCourseMetrics";

interface Props {
  data: PitchCourseData;
  /**
   * 指定時のみ「球種別」タブを表示し、タブを開いたときにだけクロス集計
   * （最大 250 セル）を取得する。ダミー表示（Paywall 用）では未指定にする。
   */
  crossFilters?: StatsFilters;
  /**
   * Paywall 用のダミー表示で「球種別」タブを体験させるためのサンプル。
   * 指定時は API を呼ばずにこのデータで球種別タブを表示する。
   */
  samplePitchTypeCross?: PitchCoursePitchTypeData;
  /**
   * Paywall 用のダミー表示で「投手別」タブを体験させるためのサンプル。
   * 指定時は API を呼ばずにこのデータで投手別タブを表示する。
   */
  samplePitcherCross?: PitcherFaceoffCourseData;
}

type PitchCourseTab = "course" | "pitch_type" | "pitcher";

interface AnalysisSettings {
  metric: PitchCourseMetric;
  granularity: PitchCourseGranularity;
  minAtBats: number;
}

function SegmentedSelector<Key extends string>({
  options,
  selectedKey,
  onSelect,
}: {
  options: readonly { key: Key; label: string }[];
  selectedKey: Key;
  onSelect: (key: Key) => void;
}) {
  return (
    <View style={styles.selectorRow}>
      {options.map(({ key, label }) => {
        const selected = key === selectedKey;
        return (
          <TouchableOpacity
            key={key}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            style={[
              styles.selectorButton,
              selected && styles.selectorButtonActive,
            ]}
            onPress={() => onSelect(key)}
          >
            <Text
              style={[
                styles.selectorLabel,
                selected && styles.selectorLabelActive,
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function MetricCell({
  cell,
  settings,
  totalPlateAppearances,
}: {
  cell: PitchCourseCell;
  settings: AnalysisSettings;
  totalPlateAppearances: number;
}) {
  const value = computePitchCourseMetric(settings.metric, cell, {
    minAtBats: settings.minAtBats,
    totalPlateAppearances,
    courseCount: cell.courseCount,
  });
  const label = cell.label ? (
    <Text style={styles.tileLabel}>{cell.label}</Text>
  ) : null;
  if (value.color === null) {
    return (
      <View
        style={[
          styles.cell,
          cell.isStrikeZone ? styles.cellStrikeEmpty : styles.cellBallEmpty,
        ]}
      >
        {label}
        <Text style={styles.cellEmptyText}>{value.valueText}</Text>
      </View>
    );
  }
  return (
    <View
      style={[
        styles.cell,
        {
          backgroundColor: value.color,
          opacity: value.isReliable ? 1 : 0.5,
        },
      ]}
    >
      {label}
      <Text style={styles.cellValue}>{value.valueText}</Text>
      {value.subText ? (
        <Text style={styles.cellDenominator}>{value.subText}</Text>
      ) : null}
    </View>
  );
}

function BandGrid({
  renderCell,
}: {
  renderCell: (index: number) => React.ReactNode;
}) {
  return (
    <View style={[styles.bandGrid, styles.grid]}>
      {PITCH_COURSE_BAND_TRACK_FRACTIONS.map((rowFlex, rowIndex) => (
        <View key={rowIndex} style={[styles.bandRow, { flex: rowFlex }]}>
          {PITCH_COURSE_BAND_TRACK_FRACTIONS.map((colFlex, colIndex) => (
            <View key={colIndex} style={{ flex: colFlex }}>
              {renderCell(rowIndex * 3 + colIndex)}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

function StrikeoutBreakdownLine({ zones }: { zones: PitchCourseZone[] }) {
  const breakdown = strikeoutBreakdown(zones);
  return (
    <Text style={styles.breakdownText}>
      三振 {breakdown.strikeouts}（空振り {breakdown.swinging}・見逃し{" "}
      {breakdown.looking}・未入力 {breakdown.unspecified}）
    </Text>
  );
}

function ZoneHeatmap({
  zones,
  settings,
}: {
  zones: PitchCourseZone[];
  settings: AnalysisSettings;
}) {
  const cells = foldPitchCourseZones(zones, settings.granularity);
  const totalPlateAppearances = sumPitchCourseCounts(zones).plate_appearances;
  const renderCell = (cell: PitchCourseCell | undefined) =>
    cell ? (
      <MetricCell
        key={cell.key}
        cell={cell}
        settings={settings}
        totalPlateAppearances={totalPlateAppearances}
      />
    ) : null;
  const cellByKey = new Map(cells.map((cell) => [cell.key, cell]));
  const axis = (
    <View style={styles.horizontalAxis}>
      <Text style={styles.axisLabel}>三塁側</Text>
      <Text style={styles.axisLabel}>真ん中</Text>
      <Text style={styles.axisLabel}>一塁側</Text>
    </View>
  );

  return (
    <View style={styles.heatmapContainer}>
      {settings.granularity === "grid5" ? (
        <>
          <PitchCourseGrid
            style={styles.grid}
            renderCell={(course) => renderCell(cellByKey.get(String(course)))}
          />
          {axis}
        </>
      ) : settings.granularity === "grid3" ? (
        <>
          <BandGrid renderCell={(index) => renderCell(cells[index])} />
          {axis}
        </>
      ) : settings.granularity === "split4" ? (
        <View style={styles.tileGroups}>
          <View style={styles.tileRow}>
            {renderCell(cellByKey.get("high"))}
            {renderCell(cellByKey.get("low"))}
          </View>
          <View style={styles.tileRow}>
            {renderCell(cellByKey.get("third_base"))}
            {renderCell(cellByKey.get("first_base"))}
          </View>
          <Text style={styles.tileNote}>
            高低と内外は別々の見方のため、同じ打席が両方に入ります（真ん中の帯は含みません）
          </Text>
        </View>
      ) : (
        <View style={styles.tileRow}>{cells.map(renderCell)}</View>
      )}
      {settings.metric === "strikeout_rate" ? (
        <StrikeoutBreakdownLine zones={zones} />
      ) : null}
    </View>
  );
}

const formatPitcherOption = (row: PitcherFaceoffCourseRow) =>
  `${row.team_name ? `${row.label}（${row.team_name}）` : row.label} ${row.plate_appearances}打席`;

function PitcherCrossPanel({
  data,
  isLoading,
  selectedPitcherId,
  onSelectPitcher,
  metric,
  granularity,
}: {
  data: PitcherFaceoffCourseData | undefined;
  isLoading: boolean;
  metric: PitchCourseMetric;
  granularity: PitchCourseGranularity;
  selectedPitcherId: number | null;
  onSelectPitcher: (pitcherId: number) => void;
}) {
  if (isLoading) {
    return (
      <View style={styles.crossLoading}>
        <ActivityIndicator color="#d08000" />
      </View>
    );
  }
  if (!data) {
    return (
      <View style={styles.crossLoading}>
        <Text style={styles.emptyHint}>
          投手別のデータを取得できませんでした
        </Text>
      </View>
    );
  }
  if (data.rows.length === 0) {
    return (
      <View style={styles.crossLoading}>
        <Text style={styles.emptyHint}>
          コースを記録した対戦が{data.min_plate_appearances}
          打席以上の投手がいません
        </Text>
      </View>
    );
  }

  const selectedRow: PitcherFaceoffCourseRow =
    data.rows.find((row) => row.id === selectedPitcherId) ?? data.rows[0];

  return (
    <>
      <Select
        variant="outlined"
        accessibilityLabel="対戦投手"
        options={data.rows.map((row) => ({
          id: row.id,
          label: formatPitcherOption(row),
        }))}
        selectedId={selectedRow.id}
        onSelect={onSelectPitcher}
        style={styles.pitcherSelect}
      />
      <ZoneHeatmap
        zones={selectedRow.zones}
        settings={{ metric, granularity, minAtBats: data.min_at_bats }}
      />
      <Notes metric={metric} minAtBats={data.min_at_bats}>
        <Text style={styles.noteText}>
          コースを記録した対戦が{data.min_plate_appearances}
          打席以上の投手のみ表示しています
        </Text>
      </Notes>
    </>
  );
}

const minimumNoteFor = (metric: PitchCourseMetric, minAtBats: number) => {
  switch (metric) {
    case "plate_appearances":
      return null;
    case "batting_average":
    case "slugging":
      return `打数が${minAtBats}未満のコースは参考値です`;
    case "strikeout_rate":
      return `打席が${STRIKEOUT_RATE_MIN_PLATE_APPEARANCES}未満のコースは参考値です`;
  }
};

const Notes = ({
  metric,
  minAtBats,
  children,
}: {
  metric: PitchCourseMetric;
  minAtBats: number;
  children?: React.ReactNode;
}) => {
  const minimumNote = minimumNoteFor(metric, minAtBats);
  return (
    <View style={styles.notes}>
      {minimumNote ? <Text style={styles.noteText}>{minimumNote}</Text> : null}
      <Text style={styles.noteText}>捕手目線で表示しています</Text>
      {children}
    </View>
  );
};

function ZoneSummaryBox({
  label,
  summary,
  courseCount,
  settings,
  totalPlateAppearances,
}: {
  label: string;
  summary: PitchCourseZoneSummary;
  courseCount: number;
  settings: AnalysisSettings;
  totalPlateAppearances: number;
}) {
  const value = computePitchCourseMetric(settings.metric, summary, {
    minAtBats: settings.minAtBats,
    totalPlateAppearances,
    courseCount,
  });
  return (
    <View style={styles.summaryBox}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryAverage}>{value.valueText}</Text>
      {value.subText ? (
        <Text style={styles.summaryDetail}>{value.subText}</Text>
      ) : null}
    </View>
  );
}

/**
 * コース別分析カード（Pro）。コース別 / 球種別 / 投手別の3タブ構成で、
 * 指標と粒度の切替は全タブ共通。球種別・投手別のクロス集計はタブを開いたときにだけ取得する。
 */
export function PitchCourseCard({
  data,
  crossFilters,
  samplePitchTypeCross,
  samplePitcherCross,
}: Props) {
  const [tab, setTab] = useState<PitchCourseTab>("course");
  const [selectedPitchTypeId, setSelectedPitchTypeId] = useState<number | null>(
    null,
  );
  const [selectedPitcherId, setSelectedPitcherId] = useState<number | null>(
    null,
  );
  const [metric, setMetric] = useState<PitchCourseMetric>("batting_average");
  const [granularity, setGranularity] =
    useState<PitchCourseGranularity>("grid5");
  const showCrossTab = crossFilters !== undefined;
  const showPitchTypeTab = showCrossTab || samplePitchTypeCross !== undefined;
  const showPitcherTab = showCrossTab || samplePitcherCross !== undefined;
  const cross = usePitchCoursePitchTypes(
    crossFilters ?? {},
    showCrossTab && samplePitchTypeCross === undefined && tab === "pitch_type",
  );
  const pitcherCross = usePitcherFaceoffCourses(
    crossFilters ?? {},
    showCrossTab && samplePitcherCross === undefined && tab === "pitcher",
  );

  if (data.total_target_pa === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>コース別分析</Text>
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

  const crossData: PitchCoursePitchTypeData | undefined =
    samplePitchTypeCross ?? cross.data;
  const isCrossLoading = samplePitchTypeCross ? false : cross.isLoading;
  const selectedRow =
    crossData?.rows.find((row) => row.id === selectedPitchTypeId) ??
    crossData?.rows.find((row) => row.plate_appearances > 0) ??
    crossData?.rows[0];
  const courseSettings: AnalysisSettings = {
    metric,
    granularity,
    minAtBats: data.min_at_bats,
  };
  const zoneSummaryTotalPlateAppearances =
    data.strike_zone.plate_appearances + data.ball_zone.plate_appearances;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>コース別分析</Text>
        <Text style={styles.targetPa}>対象 {data.total_target_pa} 打席</Text>
      </View>

      {showPitchTypeTab || showPitcherTab ? (
        <View style={styles.tabRow}>
          {(
            [
              { key: "course", label: "コース別", isAvailable: true },
              {
                key: "pitch_type",
                label: "球種別",
                isAvailable: showPitchTypeTab,
              },
              { key: "pitcher", label: "投手別", isAvailable: showPitcherTab },
            ] as const
          )
            .filter(({ isAvailable }) => isAvailable)
            .map(({ key, label }) => (
              <TouchableOpacity
                key={key}
                accessibilityRole="button"
                accessibilityState={{ selected: tab === key }}
                style={[
                  styles.tabButton,
                  tab === key && styles.tabButtonActive,
                ]}
                onPress={() => setTab(key)}
              >
                <Text
                  style={[
                    styles.tabLabel,
                    tab === key && styles.tabLabelActive,
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
        </View>
      ) : null}

      <SegmentedSelector
        options={PITCH_COURSE_METRIC_OPTIONS}
        selectedKey={metric}
        onSelect={setMetric}
      />
      <SegmentedSelector
        options={PITCH_COURSE_GRANULARITY_OPTIONS}
        selectedKey={granularity}
        onSelect={setGranularity}
      />

      {tab === "course" ? (
        <>
          <ZoneHeatmap zones={data.zones} settings={courseSettings} />
          {granularity === "zone" ? null : (
            <View style={styles.summaryRow}>
              <ZoneSummaryBox
                label="ストライクゾーン"
                summary={data.strike_zone}
                courseCount={STRIKE_ZONE_COURSES.length}
                settings={courseSettings}
                totalPlateAppearances={zoneSummaryTotalPlateAppearances}
              />
              <ZoneSummaryBox
                label="ボールゾーン"
                summary={data.ball_zone}
                courseCount={PITCH_COURSES.length - STRIKE_ZONE_COURSES.length}
                settings={courseSettings}
                totalPlateAppearances={zoneSummaryTotalPlateAppearances}
              />
            </View>
          )}
          <Notes metric={metric} minAtBats={data.min_at_bats} />
        </>
      ) : tab === "pitcher" ? (
        <PitcherCrossPanel
          data={samplePitcherCross ?? pitcherCross.data}
          isLoading={samplePitcherCross ? false : pitcherCross.isLoading}
          selectedPitcherId={selectedPitcherId}
          onSelectPitcher={setSelectedPitcherId}
          metric={metric}
          granularity={granularity}
        />
      ) : isCrossLoading ? (
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
              settings={{
                metric,
                granularity,
                minAtBats: crossData.min_at_bats,
              }}
            />
          ) : null}
          <Notes metric={metric} minAtBats={crossData.min_at_bats} />
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
  selectorRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 8,
  },
  selectorButton: {
    borderWidth: 1,
    borderColor: "#52525B",
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  selectorButtonActive: {
    backgroundColor: "#52525B",
  },
  selectorLabel: {
    color: "#A1A1AA",
    fontSize: 11,
    fontWeight: "600",
  },
  selectorLabelActive: {
    color: "#FFFFFF",
  },
  bandGrid: {
    width: "100%",
    gap: 1,
  },
  bandRow: {
    flexDirection: "row",
    gap: 1,
  },
  tileGroups: {
    gap: 8,
  },
  tileRow: {
    flexDirection: "row",
    gap: 8,
    height: 84,
  },
  tileLabel: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 11,
    marginBottom: 2,
  },
  tileNote: {
    color: "#71717A",
    fontSize: 11,
  },
  breakdownText: {
    color: "#A1A1AA",
    fontSize: 11,
    textAlign: "center",
    marginTop: 8,
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
  cellValue: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "bold",
  },
  cellDenominator: {
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
  pitcherSelect: {
    marginTop: 12,
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

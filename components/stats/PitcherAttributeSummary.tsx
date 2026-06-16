import type {
  PitcherAttributeBucket,
  PitcherAttributeSummaryData,
} from "../../types/stats";
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { PitcherStatsDetailGrid } from "@components/stats/PitcherStatsDetailGrid";
import { formatBattingAverage } from "@utils/formatBattingAverage";

interface PitcherAttributeSummaryProps {
  data: PitcherAttributeSummaryData | undefined;
}

interface Section {
  axis: AxisKey;
  title: string;
  buckets: PitcherAttributeBucket[];
}

type AxisKey =
  | "by_throw_hand"
  | "by_arm_angle"
  | "by_velocity_zone"
  | "by_pitcher_style";

type Tier = "strong" | "mid" | "weak" | "unset";

const TIER_STYLES: Record<
  Tier,
  { bg: string; border: string; accent: string; subtle?: boolean }
> = {
  strong: {
    bg: "rgba(23, 201, 100, 0.18)",
    border: "rgba(23, 201, 100, 0.55)",
    accent: "#17C964",
  },
  mid: {
    bg: "rgba(208, 128, 0, 0.16)",
    border: "rgba(208, 128, 0, 0.55)",
    accent: "#d08000",
  },
  weak: {
    bg: "rgba(243, 18, 96, 0.15)",
    border: "rgba(243, 18, 96, 0.5)",
    accent: "#F31260",
  },
  unset: {
    bg: "rgba(82, 82, 91, 0.25)",
    border: "rgba(82, 82, 91, 0.5)",
    accent: "#A1A1AA",
    subtle: true,
  },
};

const STRONG_THRESHOLD = 0.35;
const WEAK_THRESHOLD = 0.2;

const tierFor = (bucket: PitcherAttributeBucket): Tier => {
  if (bucket.at_bats === 0) return "unset";
  if (bucket.batting_average >= STRONG_THRESHOLD) return "strong";
  if (bucket.batting_average < WEAK_THRESHOLD) return "weak";
  return "mid";
};

// (axis, key) のペアでチップを一意に識別する。null キー（未設定バケット）も
// JSON.stringify で安定化された文字列にして state にしまう。
const chipId = (axis: AxisKey, key: PitcherAttributeBucket["key"]): string =>
  `${axis}:${JSON.stringify(key)}`;

/**
 * 投手属性 4 軸（利き手 / 腕の角度 / 球速帯 / 投手タイプ）の打率を、
 * 打率帯（得意 / 普通 / 苦手）で色分けしたチップで横並びに見せるカード。
 * チップタップで PitcherFaceoffList と同じ詳細グリッドを展開する。
 */
export const PitcherAttributeSummary = ({
  data,
}: PitcherAttributeSummaryProps) => {
  const [selectedChip, setSelectedChip] = useState<string | null>(null);

  if (!data) return null;

  const sections: Section[] = [
    { axis: "by_throw_hand", title: "利き手", buckets: data.by_throw_hand },
    { axis: "by_arm_angle", title: "腕の角度", buckets: data.by_arm_angle },
    {
      axis: "by_velocity_zone",
      title: "球速帯",
      buckets: data.by_velocity_zone,
    },
    {
      axis: "by_pitcher_style",
      title: "投手タイプ",
      buckets: data.by_pitcher_style,
    },
  ];

  const hasAnyData = sections.some((s) => s.buckets.length > 0);
  if (!hasAnyData) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>投手タイプ別</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>対戦データなし</Text>
          <Text style={styles.emptyNote}>
            新仕様で記録した打席（投手情報付き）が対象です
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>投手タイプ別</Text>
        <View style={styles.legendRow}>
          <LegendDot color={TIER_STYLES.strong.accent} label="得意" />
          <LegendDot color={TIER_STYLES.mid.accent} label="普通" />
          <LegendDot color={TIER_STYLES.weak.accent} label="苦手" />
        </View>
      </View>
      {sections.map((section) => (
        <AttributeSection
          key={section.axis}
          section={section}
          selectedChip={selectedChip}
          onToggle={(id) => setSelectedChip(id === selectedChip ? null : id)}
        />
      ))}
    </View>
  );
};

const LegendDot = ({ color, label }: { color: string; label: string }) => (
  <View style={styles.legendItem}>
    <View style={[styles.legendDot, { backgroundColor: color }]} />
    <Text style={styles.legendLabel}>{label}</Text>
  </View>
);

interface SectionProps {
  section: Section;
  selectedChip: string | null;
  onToggle: (id: string) => void;
}

const AttributeSection = ({
  section,
  selectedChip,
  onToggle,
}: SectionProps) => {
  if (section.buckets.length === 0) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
        <Text style={styles.sectionEmpty}>データなし</Text>
      </View>
    );
  }

  const selectedBucket = section.buckets.find(
    (b) => chipId(section.axis, b.key) === selectedChip,
  );

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <View style={styles.chipGrid}>
        {section.buckets.map((bucket) => {
          const id = chipId(section.axis, bucket.key);
          return (
            <AttributeChip
              key={id}
              bucket={bucket}
              isSelected={id === selectedChip}
              onPress={() => onToggle(id)}
            />
          );
        })}
      </View>
      {selectedBucket && (
        <View style={styles.detailWrapper}>
          <PitcherStatsDetailGrid
            plateAppearances={selectedBucket.plate_appearances}
            atBats={selectedBucket.at_bats}
            hits={selectedBucket.hits}
            baseOnBalls={selectedBucket.base_on_balls}
            hitByPitch={selectedBucket.hit_by_pitch}
            sacrificeFly={selectedBucket.sacrifice_fly}
            battingAverage={selectedBucket.batting_average}
            onBasePercentage={selectedBucket.on_base_percentage}
            sluggingPercentage={selectedBucket.slugging_percentage}
            ops={selectedBucket.ops}
            resultCounts={selectedBucket.result_counts}
          />
        </View>
      )}
    </View>
  );
};

interface ChipProps {
  bucket: PitcherAttributeBucket;
  isSelected: boolean;
  onPress: () => void;
}

const AttributeChip = ({ bucket, isSelected, onPress }: ChipProps) => {
  const tier = tierFor(bucket);
  const tierStyle = TIER_STYLES[tier];

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      style={[
        styles.chip,
        {
          backgroundColor: tierStyle.bg,
          borderColor: isSelected ? tierStyle.accent : tierStyle.border,
          borderWidth: isSelected ? 2 : 1,
        },
      ]}
    >
      <Text
        style={[styles.chipLabel, tierStyle.subtle && styles.subtleText]}
        numberOfLines={1}
      >
        {bucket.label}
      </Text>
      <Text
        style={[
          styles.chipAverage,
          { color: tierStyle.accent },
          tierStyle.subtle && styles.subtleText,
        ]}
      >
        {formatBattingAverage(bucket.batting_average, bucket.at_bats)}
      </Text>
      <Text style={styles.chipSub}>
        {bucket.at_bats}-{bucket.hits}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#3A3A3A",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  title: {
    color: "#F4F4F4",
    fontSize: 16,
    fontWeight: "700",
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  legendLabel: {
    color: "#A1A1AA",
    fontSize: 10,
    fontWeight: "600",
  },
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    color: "#A1A1AA",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
  },
  sectionEmpty: {
    color: "#71717A",
    fontSize: 11,
  },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    minWidth: 92,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: "flex-start",
  },
  chipLabel: {
    color: "#F4F4F4",
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 2,
  },
  chipAverage: {
    fontSize: 18,
    fontWeight: "800",
    lineHeight: 22,
  },
  chipSub: {
    color: "#A1A1AA",
    fontSize: 10,
    marginTop: 2,
  },
  subtleText: {
    color: "#A1A1AA",
  },
  detailWrapper: {
    marginTop: 10,
  },
  emptyState: {
    paddingVertical: 24,
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
});

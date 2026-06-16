import type {
  PitcherAttributeBucket,
  PitcherAttributeSummaryData,
} from "../../types/stats";
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { formatBattingAverage } from "@utils/formatBattingAverage";

interface PitcherAttributeSummaryProps {
  data: PitcherAttributeSummaryData | undefined;
}

interface Section {
  title: string;
  buckets: PitcherAttributeBucket[];
}

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

/**
 * 母数 0 のバケットは batting_average が 0 でも「苦手」に倒れないよう unset 扱い。
 * 母数があれば打率帯で 3 段階に色分けする。
 */
const tierFor = (bucket: PitcherAttributeBucket): Tier => {
  if (bucket.at_bats === 0) return "unset";
  if (bucket.batting_average >= STRONG_THRESHOLD) return "strong";
  if (bucket.batting_average < WEAK_THRESHOLD) return "weak";
  return "mid";
};

/**
 * 投手属性 4 軸（利き手 / 腕の角度 / 球速帯 / 投手タイプ）の打率を、
 * 打率帯（得意 / 普通 / 苦手）で色分けしたチップで横並びに見せるカード。
 * 一画面に収まる情報密度と、強み/弱みの即時判別を優先したヒートマップ風 UI。
 */
export const PitcherAttributeSummary = ({
  data,
}: PitcherAttributeSummaryProps) => {
  if (!data) return null;

  const sections: Section[] = [
    { title: "利き手", buckets: data.by_throw_hand },
    { title: "腕の角度", buckets: data.by_arm_angle },
    { title: "球速帯", buckets: data.by_velocity_zone },
    { title: "投手タイプ", buckets: data.by_pitcher_style },
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
        <AttributeSection key={section.title} {...section} />
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

const AttributeSection = ({ title, buckets }: Section) => {
  if (buckets.length === 0) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionEmpty}>データなし</Text>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.chipGrid}>
        {buckets.map((bucket) => (
          <AttributeChip
            key={`${bucket.label}-${String(bucket.key)}`}
            bucket={bucket}
          />
        ))}
      </View>
    </View>
  );
};

const AttributeChip = ({ bucket }: { bucket: PitcherAttributeBucket }) => {
  const tier = tierFor(bucket);
  const tierStyle = TIER_STYLES[tier];

  return (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: tierStyle.bg,
          borderColor: tierStyle.border,
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
    borderWidth: 1,
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

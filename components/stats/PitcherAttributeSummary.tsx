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

/**
 * 投手属性 4 軸（利き手 / 腕の角度 / 球速帯 / 投手タイプ）の打率比較カード。
 * 各セクション内でバー幅は at_bats が最大のバケットを 100% として正規化し、
 * 「未設定」バケットは back 側で末尾に並ぶようソート済み。
 */
export const PitcherAttributeSummary = ({
  data,
}: PitcherAttributeSummaryProps) => {
  if (!data) {
    return null;
  }

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
      <Text style={styles.title}>投手タイプ別</Text>
      {sections.map((section) => (
        <AttributeSection key={section.title} {...section} />
      ))}
    </View>
  );
};

const AttributeSection = ({ title, buckets }: Section) => {
  if (buckets.length === 0) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionEmpty}>データなし</Text>
      </View>
    );
  }

  const maxAtBats = Math.max(...buckets.map((b) => b.at_bats), 1);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {buckets.map((bucket) => {
        const barWidth = maxAtBats > 0 ? (bucket.at_bats / maxAtBats) * 100 : 0;
        const isUnset = bucket.key === null;
        return (
          <View
            key={`${bucket.label}-${String(bucket.key)}`}
            style={styles.barItem}
          >
            <View style={styles.barHeader}>
              <Text
                style={[styles.barLabel, isUnset && styles.unsetText]}
                numberOfLines={1}
              >
                {bucket.label}
              </Text>
              <View style={styles.barValues}>
                <Text style={[styles.barAverage, isUnset && styles.unsetText]}>
                  {formatBattingAverage(bucket.batting_average, bucket.at_bats)}
                </Text>
                <Text style={styles.barSub}>
                  ({bucket.at_bats}-{bucket.hits})
                </Text>
              </View>
            </View>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  {
                    width: `${barWidth}%`,
                    opacity: isUnset ? 0.3 : 1,
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
  title: {
    color: "#F4F4F4",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  section: {
    marginBottom: 16,
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
  barItem: {
    gap: 4,
    marginBottom: 8,
  },
  barHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  barLabel: {
    flex: 1,
    color: "#F4F4F4",
    fontSize: 13,
    fontWeight: "600",
  },
  barValues: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },
  barAverage: {
    color: "#d08000",
    fontSize: 15,
    fontWeight: "800",
  },
  barSub: {
    color: "#A1A1AA",
    fontSize: 11,
  },
  barTrack: {
    height: 4,
    backgroundColor: "#27272A",
    borderRadius: 2,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    backgroundColor: "#d08000",
    borderRadius: 2,
  },
  unsetText: {
    color: "#71717A",
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

import type { Feature, ProFeature } from "../../../types/pro";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Icon } from "@components/icon/Icon";
import {
  FEATURE_COMPARISONS,
  FEATURE_GROUPS,
  filterFeatureGroups,
  PRO_PAYWALL_COPY,
} from "./paywallContent";

interface PaywallAllFeaturesProps {
  /** 価値画面で既に説明済みの機能。一覧では重複させない。 */
  highlightedFeature?: Feature;
}

/**
 * Pro の全機能一覧。グループごとにカードを並べ、タップで説明と無料/PRO の差を開く。
 *
 * 価値画面に表を畳んで置いていたときは、開いた瞬間に 32 行が現れて読む気を削いでいた。
 * 1 機能 1 カードにして、知りたいものだけ開ける形にしている。
 */
export function PaywallAllFeatures({
  highlightedFeature,
}: PaywallAllFeaturesProps) {
  const [openFeature, setOpenFeature] = useState<ProFeature | null>(null);
  const groups = filterFeatureGroups(FEATURE_GROUPS, highlightedFeature);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pro の全機能</Text>
      <Text style={styles.lead}>
        タップすると、機能の説明と無料プランとの違いを確認できます。
      </Text>

      {groups.map((group) => (
        <View key={group.title} style={styles.group}>
          <Text style={styles.groupTitle}>{group.title}</Text>
          {group.keys.map((key) => {
            const isOpen = openFeature === key;
            const copy = PRO_PAYWALL_COPY[key];
            const comparison = FEATURE_COMPARISONS[key];
            return (
              <View key={key} style={styles.card}>
                <TouchableOpacity
                  style={styles.cardHeader}
                  onPress={() => setOpenFeature(isOpen ? null : key)}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: isOpen }}
                  accessibilityLabel={copy.title}
                >
                  <View style={styles.cardIcon}>
                    <Icon name={group.icon} size={18} color="#d08000" />
                  </View>
                  <Text style={styles.cardTitle}>{copy.title}</Text>
                  <Icon
                    name={isOpen ? "chevron-up" : "chevron-down"}
                    size={18}
                    color="#A1A1AA"
                  />
                </TouchableOpacity>
                {isOpen ? (
                  <View style={styles.cardBody}>
                    {copy.benefits?.length ? (
                      <Text style={styles.cardDescription}>
                        {copy.benefits
                          .map((benefit) => `・${benefit}`)
                          .join("\n")}
                      </Text>
                    ) : (
                      <Text style={styles.cardDescription}>
                        {copy.description}
                      </Text>
                    )}
                    <View style={styles.comparisonRow}>
                      <View style={styles.comparisonCell}>
                        <Text style={styles.comparisonLabel}>無料</Text>
                        <Text style={styles.comparisonFree}>
                          {comparison.free}
                        </Text>
                      </View>
                      <View style={styles.comparisonCell}>
                        <Text style={styles.comparisonLabel}>PRO</Text>
                        <Text style={styles.comparisonPro}>
                          {comparison.pro}
                        </Text>
                      </View>
                    </View>
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  title: {
    color: "#F4F4F4",
    fontSize: 24,
    fontWeight: "800",
    lineHeight: 34,
    marginTop: 12,
  },
  lead: {
    color: "#A1A1AA",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 6,
    marginBottom: 24,
  },
  group: {
    width: "100%",
    marginBottom: 24,
  },
  groupTitle: {
    color: "#A1A1AA",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 10,
  },
  card: {
    backgroundColor: "#27272A",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#3F3F46",
    marginBottom: 10,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  cardIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(208, 128, 0, 0.16)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    flex: 1,
    color: "#F4F4F4",
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 22,
  },
  cardBody: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    gap: 12,
  },
  cardDescription: {
    color: "#D4D4D4",
    fontSize: 13,
    lineHeight: 21,
  },
  comparisonRow: {
    flexDirection: "row",
    gap: 10,
  },
  comparisonCell: {
    flex: 1,
    backgroundColor: "#1F1F22",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    gap: 4,
  },
  comparisonLabel: {
    color: "#A1A1AA",
    fontSize: 11,
    fontWeight: "700",
  },
  comparisonFree: {
    color: "#A1A1AA",
    fontSize: 15,
    fontWeight: "700",
  },
  comparisonPro: {
    color: "#d08000",
    fontSize: 15,
    fontWeight: "800",
  },
});

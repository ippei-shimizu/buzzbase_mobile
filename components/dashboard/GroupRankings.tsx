import React from "react";
import { View, Text, StyleSheet, type ViewStyle } from "react-native";
import type { GroupRanking, RankingEntry } from "../../types/dashboard";
import { EmptyState } from "./EmptyState";

interface GroupRankingsProps {
  rankings: GroupRanking[];
  style?: ViewStyle;
}

const getRankBadgeStyle = (rank: number | null) => {
  switch (rank) {
    case 1:
      return { backgroundColor: "#EAB308", color: "#1C1917" };
    case 2:
      return { backgroundColor: "#D4D4D8", color: "#1C1917" };
    case 3:
      return { backgroundColor: "#92400E", color: "#F4F4F4" };
    default:
      return { backgroundColor: "#4A4A4A", color: "#F4F4F4" };
  }
};

const RankChange = ({ change }: { change: number | null }) => {
  if (change === null || change === 0) return null;

  const isUp = change > 0;
  return (
    <Text
      style={[styles.changeText, isUp ? styles.changeUp : styles.changeDown]}
    >
      {isUp ? "↑" : "↓"}
      {Math.abs(change)}
    </Text>
  );
};

const RankingRow = ({ entry }: { entry: RankingEntry }) => {
  const badgeStyle = getRankBadgeStyle(entry.current_rank);

  return (
    <View style={styles.rankingRow}>
      <View
        style={[
          styles.rankBadge,
          { backgroundColor: badgeStyle.backgroundColor },
        ]}
      >
        <Text style={[styles.rankText, { color: badgeStyle.color }]}>
          {entry.current_rank ?? "-"}
        </Text>
      </View>
      <View style={styles.rankingInfo}>
        <Text style={styles.rankLabel}>{entry.label}</Text>
        <Text style={styles.rankValue}>
          {entry.value !== null ? entry.value : "-"}
        </Text>
      </View>
      <RankChange change={entry.change} />
    </View>
  );
};

const GroupCard = ({ group }: { group: GroupRanking }) => {
  const allRankings = [
    ...group.batting_rankings,
    ...group.pitching_rankings,
  ];

  if (allRankings.length === 0) return null;

  return (
    <View style={styles.groupCard}>
      <View style={styles.groupHeader}>
        <Text style={styles.groupName}>{group.group_name}</Text>
        <Text style={styles.memberCount}>{group.total_members}人</Text>
      </View>

      {group.batting_rankings.length > 0 && (
        <View style={styles.categorySection}>
          <Text style={styles.categoryLabel}>打撃</Text>
          {group.batting_rankings.map((entry, i) => (
            <RankingRow key={`batting-${i}`} entry={entry} />
          ))}
        </View>
      )}

      {group.pitching_rankings.length > 0 && (
        <View style={styles.categorySection}>
          <Text style={styles.categoryLabel}>投手</Text>
          {group.pitching_rankings.map((entry, i) => (
            <RankingRow key={`pitching-${i}`} entry={entry} />
          ))}
        </View>
      )}
    </View>
  );
};

export const GroupRankings = ({ rankings, style }: GroupRankingsProps) => {
  return (
    <View style={style}>
      <Text style={styles.sectionTitle}>グループランキング</Text>
      {rankings.length === 0 ? (
        <EmptyState title="グループに所属していません" />
      ) : (
        rankings.map((group) => (
          <GroupCard key={group.group_id} group={group} />
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    color: "#F4F4F4",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  groupCard: {
    backgroundColor: "#3A3A3A",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  groupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  groupName: {
    color: "#F4F4F4",
    fontSize: 16,
    fontWeight: "700",
  },
  memberCount: {
    color: "#A1A1AA",
    fontSize: 13,
  },
  categorySection: {
    marginBottom: 8,
  },
  categoryLabel: {
    color: "#d08000",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
  },
  rankingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  rankText: {
    fontSize: 13,
    fontWeight: "700",
  },
  rankingInfo: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rankLabel: {
    color: "#F4F4F4",
    fontSize: 14,
  },
  rankValue: {
    color: "#A1A1AA",
    fontSize: 14,
  },
  changeText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 8,
    minWidth: 28,
    textAlign: "right",
  },
  changeUp: {
    color: "#22C55E",
  },
  changeDown: {
    color: "#EF4444",
  },
});

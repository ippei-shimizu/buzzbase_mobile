import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  type ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { API_BASE_URL } from "@constants/api";
import { Image } from "react-native";
import type { GroupRanking, RankingEntry } from "../../types/dashboard";
import { EmptyState } from "./EmptyState";

interface GroupRankingsProps {
  rankings: GroupRanking[];
  style?: ViewStyle;
  onGroupPress?: (groupId: number) => void;
  onShowAll?: () => void;
  onCreateGroup?: () => void;
}

const getRankStyle = (rank: number | null) => {
  switch (rank) {
    case 1:
      return { badgeBg: "#e08e0a", badgeColor: "#1C1917", rowBg: "#40382a" };
    case 2:
      return { badgeBg: "#d4d4d8", badgeColor: "#1C1917", rowBg: "#3b3b3c" };
    case 3:
      return { badgeBg: "#bb4d00", badgeColor: "#F4F4F4", rowBg: "#39302a" };
    default:
      return {
        badgeBg: "#3f3f46",
        badgeColor: "#F4F4F4",
        rowBg: "transparent",
      };
  }
};

const isHighlightRank = (rank: number | null) =>
  rank !== null && rank >= 1 && rank <= 3;

const RankingRow = ({ entry }: { entry: RankingEntry }) => {
  const rankStyle = getRankStyle(entry.current_rank);
  const highlight = isHighlightRank(entry.current_rank);

  return (
    <View
      style={[
        styles.rankingRow,
        { backgroundColor: rankStyle.rowBg },
        highlight && styles.rankingRowHighlight,
      ]}
    >
      <View style={[styles.rankBadge, { backgroundColor: rankStyle.badgeBg }]}>
        <Text style={[styles.rankText, { color: rankStyle.badgeColor }]}>
          {entry.current_rank ?? "-"}位
        </Text>
      </View>
      <Text style={[styles.rankLabel, highlight && styles.rankLabelHighlight]}>
        {entry.label}
      </Text>
      <Text style={[styles.rankValue, highlight && styles.rankValueHighlight]}>
        {entry.value !== null ? entry.value : "-"}
      </Text>
    </View>
  );
};

const GroupCard = ({
  group,
  onPress,
}: {
  group: GroupRanking;
  onPress?: (groupId: number) => void;
}) => {
  const allRankings = [...group.batting_rankings, ...group.pitching_rankings];
  if (allRankings.length === 0) return null;

  const hasIcon =
    group.group_icon &&
    !group.group_icon.endsWith(".svg") &&
    group.group_icon.length > 0;
  const iconUri = hasIcon
    ? group.group_icon!.startsWith("http")
      ? group.group_icon!
      : `${API_BASE_URL}${group.group_icon}`
    : null;

  return (
    <View style={styles.groupCard}>
      {/* Group Header */}
      <TouchableOpacity
        style={styles.groupHeader}
        activeOpacity={0.7}
        onPress={() => onPress?.(group.group_id)}
      >
        <View style={styles.groupHeaderLeft}>
          {iconUri ? (
            <Image source={{ uri: iconUri }} style={styles.groupIcon} />
          ) : (
            <View style={styles.groupIconPlaceholder}>
              <Ionicons name="people" size={18} color="#A1A1AA" />
            </View>
          )}
          <View>
            <Text style={styles.groupName}>{group.group_name}</Text>
            <Text style={styles.memberCount}>{group.total_members}人</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#A1A1AA" />
      </TouchableOpacity>

      {/* Batting Rankings */}
      {group.batting_rankings.length > 0 && (
        <View style={styles.categorySection}>
          <Text style={styles.categoryLabel}>打撃</Text>
          {group.batting_rankings.map((entry, i) => (
            <RankingRow key={`batting-${i}`} entry={entry} />
          ))}
        </View>
      )}

      {/* Pitching Rankings */}
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

export const GroupRankings = ({
  rankings,
  style,
  onGroupPress,
  onShowAll,
  onCreateGroup,
}: GroupRankingsProps) => {
  return (
    <View style={style}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>グループランキング</Text>
        {rankings.length > 0 && onShowAll && (
          <TouchableOpacity onPress={onShowAll}>
            <Text style={styles.showAllLink}>すべて見る</Text>
          </TouchableOpacity>
        )}
      </View>
      {rankings.length === 0 ? (
        <View>
          <EmptyState title="グループに所属していません" />
          {onCreateGroup && (
            <TouchableOpacity
              style={styles.createButton}
              onPress={onCreateGroup}
            >
              <Text style={styles.createButtonText}>グループを作成</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        rankings.map((group) => (
          <GroupCard
            key={group.group_id}
            group={group}
            onPress={onGroupPress}
          />
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    color: "#F4F4F4",
    fontSize: 18,
    fontWeight: "700",
  },
  showAllLink: {
    color: "#d08000",
    fontSize: 14,
    fontWeight: "500",
  },
  groupCard: {
    backgroundColor: "#2e2e2e",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#3f3f46",
    padding: 16,
    marginBottom: 12,
  },
  groupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#2e2e2e",
    borderRadius: 10,
    paddingVertical: 0,
    paddingHorizontal: 0,
    marginBottom: 8,
  },
  groupHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  groupIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  groupIconPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#525252",
    alignItems: "center",
    justifyContent: "center",
  },
  groupName: {
    color: "#F4F4F4",
    fontSize: 15,
    fontWeight: "700",
  },
  memberCount: {
    color: "#A1A1AA",
    fontSize: 12,
    marginTop: 1,
  },
  categorySection: {
    marginBottom: 8,
  },
  categoryLabel: {
    color: "#A1A1AA",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
  },
  rankingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 2,
  },
  rankingRowHighlight: {},
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  rankText: {
    fontSize: 12,
    fontWeight: "700",
  },
  rankLabel: {
    flex: 1,
    color: "#F4F4F4",
    fontSize: 14,
  },
  rankLabelHighlight: {
    fontWeight: "600",
  },
  rankValue: {
    color: "#A1A1AA",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  rankValueHighlight: {
    color: "#F4F4F4",
  },
  createButton: {
    backgroundColor: "#d08000",
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    alignSelf: "center",
    marginTop: 12,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
});

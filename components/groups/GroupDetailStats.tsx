import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import type { GroupDetail, GroupUser } from "../../types/group";

interface GroupDetailStatsProps {
  detail: GroupDetail;
}

const StatCard = ({
  user,
  battingAvg,
  battingStat,
  pitchingAgg,
  pitchingStat,
}: {
  user: GroupUser;
  battingAvg: Record<string, number | null> | undefined;
  battingStat: Record<string, number | null> | undefined;
  pitchingAgg: Record<string, number | null> | undefined;
  pitchingStat: Record<string, number | null> | undefined;
}) => {
  const hasBatting = battingAvg || battingStat;
  const hasPitching = pitchingAgg || pitchingStat;

  return (
    <View style={styles.statCard}>
      <View style={styles.userHeader}>
        {user.image?.url ? (
          <Image source={{ uri: user.image.url }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarText}>{user.name.charAt(0)}</Text>
          </View>
        )}
        <Text style={styles.userName} numberOfLines={1}>
          {user.name}
        </Text>
      </View>

      {hasBatting && (
        <View style={styles.statSection}>
          <Text style={styles.statCategory}>打撃</Text>
          <View style={styles.statGrid}>
            {battingAvg?.batting_average != null && (
              <StatItem
                label="打率"
                value={battingAvg.batting_average.toFixed(3)}
              />
            )}
            {battingStat?.home_run != null && (
              <StatItem label="本塁打" value={String(battingStat.home_run)} />
            )}
            {battingStat?.runs_batted_in != null && (
              <StatItem
                label="打点"
                value={String(battingStat.runs_batted_in)}
              />
            )}
            {battingStat?.hit != null && (
              <StatItem label="安打" value={String(battingStat.hit)} />
            )}
          </View>
        </View>
      )}

      {hasPitching && (
        <View style={styles.statSection}>
          <Text style={styles.statCategory}>投手</Text>
          <View style={styles.statGrid}>
            {pitchingStat?.era != null && (
              <StatItem label="防御率" value={pitchingStat.era.toFixed(2)} />
            )}
            {pitchingAgg?.win != null && (
              <StatItem label="勝" value={String(pitchingAgg.win)} />
            )}
            {pitchingAgg?.strikeouts != null && (
              <StatItem label="奪三振" value={String(pitchingAgg.strikeouts)} />
            )}
            {pitchingAgg?.innings_pitched != null && (
              <StatItem
                label="投球回"
                value={String(pitchingAgg.innings_pitched)}
              />
            )}
          </View>
        </View>
      )}

      {!hasBatting && !hasPitching && (
        <Text style={styles.noStats}>成績データなし</Text>
      )}
    </View>
  );
};

const StatItem = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.statItem}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

export const GroupDetailStats = ({ detail }: GroupDetailStatsProps) => {
  return (
    <View>
      <Text style={styles.sectionTitle}>メンバー成績</Text>
      {detail.accepted_users.map((user, index) => (
        <StatCard
          key={user.id}
          user={user}
          battingAvg={detail.batting_averages[index]}
          battingStat={detail.batting_stats[index]}
          pitchingAgg={detail.pitching_aggregate[index]}
          pitchingStat={detail.pitching_stats[index]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    color: "#F4F4F4",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    marginTop: 16,
  },
  statCard: {
    backgroundColor: "#3A3A3A",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  userHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  avatarPlaceholder: {
    backgroundColor: "#4A4A4A",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#F4F4F4",
    fontSize: 14,
    fontWeight: "600",
  },
  userName: {
    color: "#F4F4F4",
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
  },
  statSection: {
    marginTop: 4,
  },
  statCategory: {
    color: "#d08000",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
  },
  statGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  statItem: {
    width: "25%",
    marginBottom: 8,
  },
  statLabel: {
    color: "#A1A1AA",
    fontSize: 11,
  },
  statValue: {
    color: "#F4F4F4",
    fontSize: 15,
    fontWeight: "600",
  },
  noStats: {
    color: "#71717A",
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 8,
  },
});

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useGoalBadges } from "@hooks/useGoals";
import { formatJaFullDate } from "@utils/formatDate";

/** 目標達成バッジの一覧。FinalizeGoalsJobが目標達成時に付与したバッジを表示する。 */
export default function GoalBadgesScreen() {
  const { badges, isLoading } = useGoalBadges();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#d08000" />
      </View>
    );
  }

  if (badges.length === 0) {
    return (
      <View style={styles.center}>
        <Ionicons name="ribbon-outline" size={40} color="#71717A" />
        <Text style={styles.emptyText}>まだ達成バッジはありません</Text>
        <Text style={styles.emptySubText}>
          目標を達成すると、ここにバッジが並びます
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {badges.map((badge) => (
        <View key={badge.id} style={styles.card}>
          <View style={styles.iconWrap}>
            <Ionicons name="ribbon" size={28} color="#FFD43B" />
          </View>
          <View style={styles.textWrap}>
            <Text style={styles.badgeName}>{badge.badge_name}</Text>
            <Text style={styles.goalTitle} numberOfLines={1}>
              {badge.goal_title}
            </Text>
            <Text style={styles.awardedAt}>
              {formatJaFullDate(badge.awarded_at)}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#2E2E2E" },
  content: { padding: 16, gap: 12 },
  center: {
    flex: 1,
    backgroundColor: "#2E2E2E",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 8,
  },
  emptyText: { color: "#F4F4F4", fontSize: 15, fontWeight: "600" },
  emptySubText: { color: "#A1A1AA", fontSize: 13 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#3A3A3A",
    borderRadius: 12,
    padding: 14,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#424242",
    alignItems: "center",
    justifyContent: "center",
  },
  textWrap: { flex: 1, gap: 2 },
  badgeName: { color: "#F4F4F4", fontSize: 15, fontWeight: "700" },
  goalTitle: { color: "#D4D4D4", fontSize: 13 },
  awardedAt: { color: "#71717A", fontSize: 12 },
});

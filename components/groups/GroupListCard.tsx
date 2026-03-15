import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import type { Group } from "../../types/group";

interface GroupListCardProps {
  group: Group;
  onPress: (id: number) => void;
}

export const GroupListCard = ({ group, onPress }: GroupListCardProps) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(group.id)}
      activeOpacity={0.7}
    >
      {group.icon?.url ? (
        <Image source={{ uri: group.icon.url }} style={styles.icon} />
      ) : (
        <View style={[styles.icon, styles.iconPlaceholder]}>
          <Text style={styles.iconText}>{group.name.charAt(0)}</Text>
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {group.name}
        </Text>
        <Text style={styles.memberCount}>
          {group.group_users.length}人のメンバー
        </Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3A3A3A",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  iconPlaceholder: {
    backgroundColor: "#4A4A4A",
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    color: "#F4F4F4",
    fontSize: 20,
    fontWeight: "700",
  },
  info: {
    flex: 1,
  },
  name: {
    color: "#F4F4F4",
    fontSize: 16,
    fontWeight: "600",
  },
  memberCount: {
    color: "#A1A1AA",
    fontSize: 13,
    marginTop: 2,
  },
  chevron: {
    color: "#A1A1AA",
    fontSize: 24,
    marginLeft: 8,
  },
});

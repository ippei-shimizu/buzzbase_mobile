import React from "react";
import { Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { GroupDefaultIcon } from "@components/icon/GroupDefaultIcon";
import type { Group } from "../../types/group";

interface GroupListCardProps {
  group: Group;
  onPress: (id: number) => void;
}

export const GroupListCard = ({ group, onPress }: GroupListCardProps) => {
  const iconUrl = group.icon?.url;
  const hasValidIcon =
    iconUrl && !iconUrl.endsWith(".svg") && iconUrl.length > 0;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(group.id)}
      activeOpacity={0.7}
    >
      {hasValidIcon ? (
        <Image source={{ uri: iconUrl }} style={styles.icon} />
      ) : (
        <GroupDefaultIcon size={48} />
      )}
      <Text style={styles.name} numberOfLines={1}>
        {group.name}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#3f3f46",
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  name: {
    flex: 1,
    color: "#F4F4F4",
    fontSize: 16,
    fontWeight: "600",
  },
});

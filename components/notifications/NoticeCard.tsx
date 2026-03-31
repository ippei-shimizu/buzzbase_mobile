import type { ManagementNotice } from "../../types/notification";
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface NoticeCardProps {
  notice: ManagementNotice;
  onPress: (id: number) => void;
}

export const NoticeCard = ({ notice, onPress }: NoticeCardProps) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(notice.id)}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {notice.title}
        </Text>
        <Text style={styles.date}>{notice.published_at}</Text>
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
  content: {
    flex: 1,
  },
  title: {
    color: "#F4F4F4",
    fontSize: 15,
    fontWeight: "600",
  },
  date: {
    color: "#A1A1AA",
    fontSize: 13,
    marginTop: 4,
  },
  chevron: {
    color: "#A1A1AA",
    fontSize: 24,
    marginLeft: 8,
  },
});

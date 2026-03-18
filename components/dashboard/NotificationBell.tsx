import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { NotificationIcon } from "@components/icon/NotificationIcon";

interface NotificationBellProps {
  count: number;
  onPress: () => void;
}

export const NotificationBell = ({ count, onPress }: NotificationBellProps) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <NotificationIcon size={24} color="#F4F4F4" />
      {count > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count > 99 ? "99+" : count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 4,
    marginRight: 8,
  },
  badge: {
    position: "absolute",
    top: 0,
    right: 2,
    backgroundColor: "#EF4444",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
});

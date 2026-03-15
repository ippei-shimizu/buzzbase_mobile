import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import type { FollowingUser } from "../../types/group";

interface UserRowProps {
  user: FollowingUser;
  onPress: (userId: string) => void;
}

export const UserRow = ({ user, onPress }: UserRowProps) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(user.user_id)}
      activeOpacity={0.7}
    >
      {user.image?.url ? (
        <Image source={{ uri: user.image.url }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.placeholder]}>
          <Text style={styles.placeholderText}>
            {user.name?.charAt(0) ?? "?"}
          </Text>
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {user.name}
        </Text>
        <Text style={styles.userId} numberOfLines={1}>
          @{user.user_id}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  placeholder: {
    backgroundColor: "#424242",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: "#d08000",
    fontSize: 18,
    fontWeight: "700",
  },
  info: {
    marginLeft: 12,
    flex: 1,
  },
  name: {
    color: "#F4F4F4",
    fontSize: 15,
    fontWeight: "600",
  },
  userId: {
    color: "#A1A1AA",
    fontSize: 13,
    marginTop: 2,
  },
});

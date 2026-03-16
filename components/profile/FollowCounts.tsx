import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface FollowCountsProps {
  followingCount: number;
  followersCount: number;
  onFollowingPress: () => void;
  onFollowersPress: () => void;
}

export const FollowCounts = ({
  followingCount,
  followersCount,
  onFollowingPress,
  onFollowersPress,
}: FollowCountsProps) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.item} onPress={onFollowingPress}>
        <Text style={styles.count}>{followingCount}</Text>
        <Text style={styles.label}> フォロー中</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.item} onPress={onFollowersPress}>
        <Text style={styles.count}>{followersCount}</Text>
        <Text style={styles.label}> フォロワー</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 20,
    marginTop: 10,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
  },
  count: {
    color: "#F4F4F4",
    fontSize: 14,
    fontWeight: "700",
  },
  label: {
    color: "#A1A1AA",
    fontSize: 14,
  },
});

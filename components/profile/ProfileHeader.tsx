import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import type { UserProfile, FollowStatus } from "../../types/profile";
import { FollowCounts } from "./FollowCounts";
import { FollowButton } from "./FollowButton";

interface ProfileHeaderProps {
  profile: UserProfile;
  followingCount?: number;
  followersCount?: number;
  followStatus?: FollowStatus;
  onFollowPress?: () => void;
  onFollowingCountPress?: () => void;
  onFollowersCountPress?: () => void;
  isFollowLoading?: boolean;
}

export const ProfileHeader = ({
  profile,
  followingCount,
  followersCount,
  followStatus,
  onFollowPress,
  onFollowingCountPress,
  onFollowersCountPress,
  isFollowLoading,
}: ProfileHeaderProps) => {
  return (
    <View style={styles.container}>
      {profile.image?.url ? (
        <Image source={{ uri: profile.image.url }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.placeholder]}>
          <Text style={styles.placeholderText}>
            {profile.name?.charAt(0) ?? "?"}
          </Text>
        </View>
      )}
      <Text style={styles.name}>{profile.name ?? "未設定"}</Text>
      {profile.user_id && <Text style={styles.userId}>@{profile.user_id}</Text>}
      {profile.introduction && (
        <Text style={styles.introduction}>{profile.introduction}</Text>
      )}
      {followingCount != null && followersCount != null && (
        <FollowCounts
          followingCount={followingCount}
          followersCount={followersCount}
          onFollowingPress={onFollowingCountPress ?? (() => {})}
          onFollowersPress={onFollowersCountPress ?? (() => {})}
        />
      )}
      {followStatus && followStatus !== "self" && onFollowPress && (
        <View style={styles.followButtonContainer}>
          <FollowButton
            followStatus={followStatus}
            onPress={onFollowPress}
            isLoading={isFollowLoading ?? false}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  placeholder: {
    backgroundColor: "#424242",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: "#d08000",
    fontSize: 28,
    fontWeight: "700",
  },
  name: {
    color: "#F4F4F4",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 12,
  },
  userId: {
    color: "#A1A1AA",
    fontSize: 14,
    marginTop: 4,
  },
  introduction: {
    color: "#D4D4D8",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },
  followButtonContainer: {
    marginTop: 12,
  },
});

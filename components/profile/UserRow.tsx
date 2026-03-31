import type { FollowingUser } from "../../types/group";
import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { DefaultUserIcon } from "@components/ui/DefaultUserIcon";
import { API_BASE_URL } from "@constants/api";

interface UserRowProps {
  user: FollowingUser;
  onPress: (userId: string) => void;
  onFollowPress?: (userId: number) => void;
  showFollowButton?: boolean;
  isSelf?: boolean;
}

export const UserRow = ({
  user,
  onPress,
  onFollowPress,
  showFollowButton = false,
  isSelf = false,
}: UserRowProps) => {
  const hasValidImage =
    user.image?.url &&
    !user.image.url.endsWith(".svg") &&
    user.image.url.length > 0;
  const imageSource = hasValidImage
    ? {
        uri: user.image!.url!.startsWith("http")
          ? user.image!.url!
          : `${API_BASE_URL}${user.image!.url}`,
      }
    : null;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(user.user_id)}
      activeOpacity={0.7}
    >
      {imageSource ? (
        <Image source={imageSource} style={styles.avatar} />
      ) : (
        <DefaultUserIcon size={40} />
      )}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {user.name}
        </Text>
        <Text style={styles.userId} numberOfLines={1}>
          @{user.user_id}
        </Text>
      </View>
      {showFollowButton && !isSelf && (
        <TouchableOpacity
          style={[
            styles.followButton,
            user.isFollowing
              ? styles.followingButton
              : styles.notFollowingButton,
          ]}
          onPress={() => onFollowPress?.(user.id)}
        >
          <Text
            style={[
              styles.followButtonText,
              user.isFollowing
                ? styles.followingButtonText
                : styles.notFollowingButtonText,
            ]}
          >
            {user.isFollowing ? "フォロー中" : "フォロー"}
          </Text>
        </TouchableOpacity>
      )}
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
    width: 40,
    height: 40,
    borderRadius: 20,
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
  followButton: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginLeft: 8,
  },
  followingButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#71717b",
  },
  notFollowingButton: {
    backgroundColor: "#d08000",
  },
  followButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },
  followingButtonText: {
    color: "#F4F4F4",
  },
  notFollowingButtonText: {
    color: "#FFFFFF",
  },
});

import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import type { UserProfile } from "../../types/profile";

interface ProfileHeaderProps {
  profile: UserProfile;
}

export const ProfileHeader = ({ profile }: ProfileHeaderProps) => {
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
});

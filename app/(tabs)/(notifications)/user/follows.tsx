import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { UserRow } from "@components/profile/UserRow";
import { useFollowingUsers } from "@hooks/useGroups";
import { useProfile } from "@hooks/useProfile";
import {
  useFollowersUsers,
  useFollowUser,
  useUnfollowUser,
} from "@hooks/useRelationship";

export default function NotificationFollowsScreen() {
  const { id, tab } = useLocalSearchParams<{ id: string; tab?: string }>();
  const router = useRouter();
  const numericId = id ? Number(id) : undefined;
  const { profile } = useProfile();
  const { followUser } = useFollowUser();
  const { unfollowUser } = useUnfollowUser();

  const [activeTab, setActiveTab] = useState<"following" | "followers">(
    tab === "followers" ? "followers" : "following",
  );

  const {
    users: followingUsers,
    isLoading: isFollowingLoading,
    isError: isFollowingError,
  } = useFollowingUsers(numericId);

  const {
    users: followersUsers,
    isLoading: isFollowersLoading,
    isError: isFollowersError,
  } = useFollowersUsers(numericId);

  const users = activeTab === "following" ? followingUsers : followersUsers;
  const isLoading =
    activeTab === "following" ? isFollowingLoading : isFollowersLoading;
  const isError =
    activeTab === "following" ? isFollowingError : isFollowersError;

  const handleUserPress = (userId: string) => {
    router.push(`/(notifications)/user/${userId}`);
  };

  const handleFollowPress = async (userId: number) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    if (user.isFollowing) {
      await unfollowUser(userId);
    } else {
      await followUser(userId);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "following" && styles.activeTab]}
          onPress={() => setActiveTab("following")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "following" && styles.activeTabText,
            ]}
          >
            フォロー中
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "followers" && styles.activeTab]}
          onPress={() => setActiveTab("followers")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "followers" && styles.activeTabText,
            ]}
          >
            フォロワー
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#d08000" />
        </View>
      ) : isError ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>データの取得に失敗しました</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <UserRow
              user={item}
              onPress={handleUserPress}
              showFollowButton
              isSelf={item.id === profile?.id}
              onFollowPress={handleFollowPress}
            />
          )}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>
                {activeTab === "following"
                  ? "フォロー中のユーザーはいません"
                  : "フォロワーはいません"}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2E2E2E",
  },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#424242",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#d08000",
  },
  tabText: {
    color: "#A1A1AA",
    fontSize: 14,
    fontWeight: "600",
  },
  activeTabText: {
    color: "#d08000",
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
  },
  emptyText: {
    color: "#A1A1AA",
    fontSize: 14,
  },
});

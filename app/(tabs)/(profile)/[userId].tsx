import React from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ProfileHeader } from "@components/profile/ProfileHeader";
import {
  useUserProfileDetail,
  useFollowUser,
  useUnfollowUser,
} from "@hooks/useRelationship";
import {
  useTeams,
  usePrefectures,
  useBaseballCategories,
} from "@hooks/useMasterData";
import { useUserAwards } from "@hooks/useAwards";

export default function UserProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const router = useRouter();

  const { data, isLoading, refetch, isRefreshing } =
    useUserProfileDetail(userId);
  const { followUser, isFollowing } = useFollowUser();
  const { unfollowUser, isUnfollowing } = useUnfollowUser();

  const { data: teams } = useTeams();
  const { data: prefectures } = usePrefectures();
  const { data: categories } = useBaseballCategories();
  const { data: awards } = useUserAwards(data?.user.id);

  const team = teams?.find((t) => t.id === data?.user.team_id);
  const categoryName = categories?.find(
    (c) => c.id === team?.category_id,
  )?.name;
  const prefectureName = prefectures?.find(
    (p) => p.id === team?.prefecture_id,
  )?.name;

  const handleFollowPress = async () => {
    if (!data) return;

    if (
      data.follow_status === "following" ||
      data.follow_status === "pending"
    ) {
      await unfollowUser(data.user.id);
    } else if (data.follow_status === "none") {
      await followUser(data.user.id);
    }
  };

  const handleFollowingCountPress = () => {
    if (!data) return;
    router.push({
      pathname: "/(profile)/follows",
      params: { id: String(data.user.id), tab: "following" },
    });
  };

  const handleFollowersCountPress = () => {
    if (!data) return;
    router.push({
      pathname: "/(profile)/follows",
      params: { id: String(data.user.id), tab: "followers" },
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#d08000" />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>ユーザーが見つかりません</Text>
      </View>
    );
  }

  const isPrivateAndNotFollowing =
    data.is_private &&
    data.follow_status !== "following" &&
    data.follow_status !== "self";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={refetch}
          tintColor="#d08000"
        />
      }
    >
      <ProfileHeader
        profile={data.user}
        followingCount={data.following_count ?? 0}
        followersCount={data.followers_count ?? 0}
        followStatus={data.follow_status}
        onFollowPress={handleFollowPress}
        onFollowingCountPress={handleFollowingCountPress}
        onFollowersCountPress={handleFollowersCountPress}
        isFollowLoading={isFollowing || isUnfollowing}
        positions={data.user.positions}
        teamName={team?.name}
        categoryName={categoryName}
        prefectureName={prefectureName}
        awards={awards}
      />

      {isPrivateAndNotFollowing && (
        <View style={styles.privateContainer}>
          <Text style={styles.privateText}>このアカウントは非公開です</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2E2E2E",
  },
  container: {
    flex: 1,
    backgroundColor: "#2E2E2E",
  },
  contentContainer: {
    paddingBottom: 32,
  },
  errorText: {
    color: "#A1A1AA",
    fontSize: 16,
  },
  privateContainer: {
    alignItems: "center",
    paddingVertical: 32,
    borderTopWidth: 1,
    borderTopColor: "#424242",
    marginHorizontal: 16,
  },
  privateText: {
    color: "#A1A1AA",
    fontSize: 14,
  },
});

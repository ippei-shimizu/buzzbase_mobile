import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useProfile } from "@hooks/useProfile";
import { useProfileStats } from "@hooks/useProfileStats";
import { useUserProfileDetail } from "@hooks/useRelationship";
import { ProfileHeader } from "@components/profile/ProfileHeader";
import { ProfileStatsTab } from "@components/profile/ProfileStatsTab";
import { ProfileGamesTab } from "@components/profile/ProfileGamesTab";
import type { StatsFilters } from "../../../types/profile";

export default function ProfileScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [filters] = useState<StatsFilters>({});

  const { profile, isLoading, refetch, isRefreshing } = useProfile();
  const { data: profileDetail } = useUserProfileDetail(
    profile?.user_id ?? undefined,
  );
  const {
    battingStats,
    pitchingStats,
    isLoading: isStatsLoading,
    refetch: refetchStats,
    isRefreshing: isStatsRefreshing,
  } = useProfileStats(filters);

  const handleRefresh = () => {
    refetch();
    refetchStats();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#d08000" />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push("/(profile)/edit")}>
              <Ionicons name="settings-outline" size={22} color="#F4F4F4" />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.container}>
        {profile && (
          <ProfileHeader
            profile={profile}
            followingCount={profileDetail?.following_count ?? undefined}
            followersCount={profileDetail?.followers_count ?? undefined}
            onFollowingCountPress={() => {
              if (profileDetail) {
                router.push({
                  pathname: "/(profile)/follows",
                  params: {
                    id: String(profileDetail.user.id),
                    tab: "following",
                  },
                });
              }
            }}
            onFollowersCountPress={() => {
              if (profileDetail) {
                router.push({
                  pathname: "/(profile)/follows",
                  params: {
                    id: String(profileDetail.user.id),
                    tab: "followers",
                  },
                });
              }
            }}
          />
        )}

        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 0 && styles.activeTab]}
            onPress={() => setActiveTab(0)}
          >
            <Text
              style={[styles.tabText, activeTab === 0 && styles.activeTabText]}
            >
              成績
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 1 && styles.activeTab]}
            onPress={() => setActiveTab(1)}
          >
            <Text
              style={[styles.tabText, activeTab === 1 && styles.activeTabText]}
            >
              試合
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 0 ? (
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing || isStatsRefreshing}
                onRefresh={handleRefresh}
                tintColor="#d08000"
              />
            }
          >
            {isStatsLoading ? (
              <ActivityIndicator color="#d08000" style={{ marginTop: 20 }} />
            ) : (
              <ProfileStatsTab
                battingStats={battingStats}
                pitchingStats={pitchingStats}
              />
            )}
          </ScrollView>
        ) : (
          <View style={styles.content}>
            <ProfileGamesTab />
          </View>
        )}
      </View>
    </>
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
});

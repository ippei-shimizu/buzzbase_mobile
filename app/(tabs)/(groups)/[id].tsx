import React from "react";
import {
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useGroupDetail } from "@hooks/useGroups";
import { GroupDetailStats } from "@components/groups/GroupDetailStats";

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const groupId = id ? Number(id) : undefined;
  const { data, isLoading, refetch, isRefreshing } = useGroupDetail(groupId);

  if (isLoading || !data) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#d08000" />
      </View>
    );
  }

  const { group, accepted_users } = data;

  return (
    <>
      <Stack.Screen
        options={{
          title: group.name,
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push(`/(groups)/members?id=${group.id}`)}
            >
              <Text style={styles.headerButton}>👥</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refetch}
            tintColor="#d08000"
          />
        }
      >
        <View style={styles.header}>
          {group.icon?.url ? (
            <Image source={{ uri: group.icon.url }} style={styles.icon} />
          ) : (
            <View style={[styles.icon, styles.iconPlaceholder]}>
              <Text style={styles.iconText}>{group.name.charAt(0)}</Text>
            </View>
          )}
          <Text style={styles.groupName}>{group.name}</Text>
          <Text style={styles.memberCount}>
            {accepted_users.length}人のメンバー
          </Text>
        </View>

        <GroupDetailStats detail={data} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2E2E2E",
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2E2E2E",
  },
  headerButton: {
    fontSize: 20,
    paddingRight: 8,
  },
  header: {
    alignItems: "center",
    paddingVertical: 16,
  },
  icon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginBottom: 12,
  },
  iconPlaceholder: {
    backgroundColor: "#4A4A4A",
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    color: "#F4F4F4",
    fontSize: 28,
    fontWeight: "700",
  },
  groupName: {
    color: "#F4F4F4",
    fontSize: 20,
    fontWeight: "700",
  },
  memberCount: {
    color: "#A1A1AA",
    fontSize: 14,
    marginTop: 4,
  },
});

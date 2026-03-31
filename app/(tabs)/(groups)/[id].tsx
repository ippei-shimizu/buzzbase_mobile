import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
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
import { GroupDetailStats } from "@components/groups/GroupDetailStats";
import { GroupDefaultIcon } from "@components/icon/GroupDefaultIcon";
import { useGroupDetail } from "@hooks/useGroups";

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
  const hasValidIcon =
    group.icon?.url &&
    !group.icon.url.endsWith(".svg") &&
    group.icon.url.length > 0;

  return (
    <>
      <Stack.Screen
        options={{
          title: "",
          headerTitle: () => null,
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push(`/(groups)/members?id=${group.id}`)}
            >
              <Ionicons name="menu-outline" size={24} color="#F4F4F4" />
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
        <View style={styles.groupNameRow}>
          {hasValidIcon ? (
            <Image
              source={{ uri: group.icon!.url! }}
              style={styles.groupNameIcon}
            />
          ) : (
            <GroupDefaultIcon size={40} />
          )}
          <View>
            <Text style={styles.groupName}>{group.name}</Text>
            <Text style={styles.memberCount}>{accepted_users.length}人</Text>
          </View>
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
    paddingBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2E2E2E",
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  headerTitle: {
    color: "#F4F4F4",
    fontSize: 16,
    fontWeight: "600",
    maxWidth: 200,
  },
  groupNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  groupNameIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  groupName: {
    color: "#F4F4F4",
    fontSize: 18,
    fontWeight: "700",
  },
  memberCount: {
    color: "#A1A1AA",
    fontSize: 13,
    marginTop: 2,
  },
});

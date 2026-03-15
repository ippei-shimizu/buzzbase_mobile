import React from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { useGroups } from "@hooks/useGroups";
import { GroupListCard } from "@components/groups/GroupListCard";
import { EmptyState } from "@components/dashboard/EmptyState";

export default function GroupsTabScreen() {
  const router = useRouter();
  const { groups, isLoading, refetch, isRefreshing } = useGroups();

  const handleGroupPress = (id: number) => {
    router.push(`/(groups)/${id}`);
  };

  const handleCreate = () => {
    router.push("/(groups)/create");
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
            <TouchableOpacity onPress={handleCreate}>
              <Text style={styles.headerButton}>+</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <FlatList
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          groups.length === 0 && styles.emptyContent,
        ]}
        data={groups}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <GroupListCard group={item} onPress={handleGroupPress} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <EmptyState
              title="グループに所属していません"
              subtitle="グループを作成して仲間と成績を共有しましょう"
            />
            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreate}
            >
              <Text style={styles.createButtonText}>グループを作成</Text>
            </TouchableOpacity>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refetch}
            tintColor="#d08000"
          />
        }
      />
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
  emptyContent: {
    flex: 1,
    justifyContent: "center",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2E2E2E",
  },
  headerButton: {
    color: "#d08000",
    fontSize: 28,
    fontWeight: "600",
    paddingRight: 8,
  },
  emptyContainer: {
    alignItems: "center",
  },
  createButton: {
    backgroundColor: "#d08000",
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 16,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
});

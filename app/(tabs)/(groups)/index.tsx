import { Ionicons } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";
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
import { GroupListCard } from "@components/groups/GroupListCard";
import { useGroups } from "@hooks/useGroups";

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

  const banner = (
    <View style={styles.banner}>
      <Text style={styles.bannerTitle}>友達とグループを作成しよう！</Text>
      <Text style={styles.bannerDescription}>
        グループ機能は、フォローしているユーザーを招待して成績をランキング形式で共有することができます。
      </Text>
      <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
        <Text style={styles.createButtonText}>グループ作成</Text>
        <Ionicons name="add-circle" size={18} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );

  const groupListHeader =
    groups.length > 0 ? (
      <Text style={styles.sectionTitle}>グループ</Text>
    ) : null;

  return (
    <>
      <Stack.Screen options={{ headerRight: () => null }} />
      <FlatList
        style={styles.container}
        contentContainerStyle={styles.content}
        data={groups}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <GroupListCard group={item} onPress={handleGroupPress} />
        )}
        ListHeaderComponent={
          <>
            {banner}
            {groupListHeader}
          </>
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
    paddingBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2E2E2E",
  },
  banner: {
    backgroundColor: "#27272a",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    alignItems: "center",
  },
  bannerTitle: {
    color: "#d08000",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  bannerDescription: {
    color: "#A1A1AA",
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 16,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#d08000",
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  sectionTitle: {
    color: "#F4F4F4",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
});

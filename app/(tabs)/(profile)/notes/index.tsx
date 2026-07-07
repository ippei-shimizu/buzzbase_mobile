import { Ionicons } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";
import React from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { NoteListCard } from "@components/baseball-notes/NoteListCard";
import { useBaseballNotes } from "@hooks/useBaseballNotes";

export default function NotesIndexScreen() {
  const router = useRouter();
  const { notes, isLoading, refetch, isRefreshing } = useBaseballNotes();

  const handlePress = (id: number) => {
    router.push({
      pathname: "/(profile)/notes/[id]",
      params: { id: String(id) },
    });
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.templateButton}
                onPress={() => router.push("/(reflect-template)/list")}
                accessibilityRole="button"
                accessibilityLabel="振り返りテンプレを管理"
              >
                <Ionicons
                  name="document-text-outline"
                  size={16}
                  color="#F4F4F4"
                />
                <Text style={styles.templateButtonText}>テンプレ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push("/(profile)/notes/create")}
                accessibilityRole="button"
                accessibilityLabel="ノートを作成"
              >
                <Ionicons name="add" size={24} color="#F4F4F4" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <View style={styles.container}>
        {isLoading ? (
          <ActivityIndicator
            size="large"
            color="#d08000"
            style={styles.loader}
          />
        ) : (
          <FlatList
            data={notes}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <NoteListCard note={item} onPress={handlePress} />
            )}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={refetch}
                tintColor="#d08000"
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>ノートがありません</Text>
                <Text style={styles.emptySubText}>
                  右上の「+」から作成できます
                </Text>
              </View>
            }
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2E2E2E",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  templateButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#3A3A3A",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  templateButtonText: {
    color: "#F4F4F4",
    fontSize: 13,
    fontWeight: "600",
  },
  loader: {
    marginTop: 40,
  },
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 60,
  },
  emptyText: {
    color: "#A1A1AA",
    fontSize: 16,
    fontWeight: "600",
  },
  emptySubText: {
    color: "#71717A",
    fontSize: 13,
    marginTop: 8,
  },
});

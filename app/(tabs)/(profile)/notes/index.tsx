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
            <TouchableOpacity
              onPress={() => router.push("/(profile)/notes/create")}
            >
              <Ionicons name="add" size={24} color="#F4F4F4" />
            </TouchableOpacity>
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

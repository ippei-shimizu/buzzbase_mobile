import type { Season } from "../../../../types/season";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Platform,
} from "react-native";
import {
  useCreateSeason,
  useUpdateSeason,
  useDeleteSeason,
} from "@hooks/useSeasonMutations";
import { useMySeasons } from "@hooks/useSeasons";

export default function SeasonsScreen() {
  const { seasons, isLoading, refetch, isRefreshing } = useMySeasons();
  const { createSeason, isCreating } = useCreateSeason();
  const { updateSeason } = useUpdateSeason();
  const { deleteSeason } = useDeleteSeason();

  const handleCreate = () => {
    if (Platform.OS === "ios") {
      Alert.prompt(
        "シーズン作成",
        "シーズン名を入力してください",
        [
          { text: "キャンセル", style: "cancel" },
          {
            text: "作成",
            onPress: (name?: string) => {
              if (name?.trim()) {
                createSeason({ name: name.trim() });
              }
            },
          },
        ],
        "plain-text",
        "",
        "default",
      );
    } else {
      // Android: Alert.prompt is not available
      Alert.alert(
        "シーズン作成",
        "iOSでのみシーズン名を入力できます。Webからシーズンを作成してください。",
      );
    }
  };

  const handleEdit = (season: Season) => {
    if (Platform.OS === "ios") {
      Alert.prompt(
        "シーズン名を変更",
        "",
        [
          { text: "キャンセル", style: "cancel" },
          {
            text: "変更",
            onPress: (name?: string) => {
              if (name?.trim() && name.trim() !== season.name) {
                updateSeason({ id: season.id, params: { name: name.trim() } });
              }
            },
          },
        ],
        "plain-text",
        season.name,
        "default",
      );
    }
  };

  const handleDelete = (season: Season) => {
    const message =
      season.game_results_count > 0
        ? `「${season.name}」には${season.game_results_count}件の試合記録が紐付いています。削除すると試合記録のシーズン情報が解除されます。本当に削除しますか？`
        : `「${season.name}」を削除しますか？`;

    Alert.alert("シーズン削除", message, [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除",
        style: "destructive",
        onPress: () => deleteSeason(season.id),
      },
    ]);
  };

  const renderItem = ({ item }: { item: Season }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <Text style={styles.seasonName}>{item.name}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.game_results_count}試合</Text>
        </View>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEdit(item)}
        >
          <Ionicons name="pencil-outline" size={18} color="#A1A1AA" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDelete(item)}
        >
          <Ionicons name="trash-outline" size={18} color="#F31260" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="calendar-outline" size={48} color="#52525B" />
        <Text style={styles.emptyText}>シーズンがありません</Text>
        <Text style={styles.emptySubtext}>
          右上の「+」ボタンからシーズンを作成できます
        </Text>
      </View>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <TouchableOpacity onPress={handleCreate} disabled={isCreating}>
              {isCreating ? (
                <ActivityIndicator size="small" color="#d08000" />
              ) : (
                <Ionicons name="add" size={26} color="#d08000" />
              )}
            </TouchableOpacity>
          ),
        }}
      />
      <View style={styles.container}>
        {isLoading ? (
          <ActivityIndicator
            size="large"
            color="#d08000"
            style={{ marginTop: 40 }}
          />
        ) : (
          <FlatList
            data={seasons}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
            ListEmptyComponent={renderEmpty}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={refetch}
                tintColor="#d08000"
              />
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
  listContent: {
    padding: 16,
    paddingBottom: 32,
    flexGrow: 1,
  },
  card: {
    backgroundColor: "#3A3A3A",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  seasonName: {
    color: "#F4F4F4",
    fontSize: 16,
    fontWeight: "600",
  },
  badge: {
    backgroundColor: "#424242",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    color: "#A1A1AA",
    fontSize: 12,
  },
  cardActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    padding: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
  },
  emptyText: {
    color: "#A1A1AA",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
  },
  emptySubtext: {
    color: "#52525B",
    fontSize: 13,
    marginTop: 8,
    textAlign: "center",
  },
});

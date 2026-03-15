import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useUserSearch } from "@hooks/useUserSearch";
import { UserRow } from "@components/profile/UserRow";
import type { FollowingUser } from "../../../types/group";
import type { SearchUser } from "../../../types/user";

const toFollowingUser = (user: SearchUser): FollowingUser => ({
  ...user,
  isFollowing: false,
});

export default function UserSearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const { users, isLoading, isError } = useUserSearch(query);

  const handleUserPress = (userId: string) => {
    router.push(`/(profile)/${userId}`);
  };

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#d08000" />
        </View>
      );
    }

    if (isError) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>検索中にエラーが発生しました</Text>
        </View>
      );
    }

    if (query.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="search" size={48} color="#424242" />
          <Text style={styles.emptyText}>
            ユーザー名またはIDで検索してください
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>ユーザーが見つかりませんでした</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBarContainer}>
        <Ionicons
          name="search"
          size={18}
          color="#A1A1AA"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="ユーザー名またはIDで検索"
          placeholderTextColor="#A1A1AA"
          value={query}
          onChangeText={setQuery}
          autoFocus
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity
            onPress={() => setQuery("")}
            style={styles.clearButton}
          >
            <Ionicons name="close-circle" size={18} color="#A1A1AA" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={users.map(toFollowingUser)}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <UserRow user={item} onPress={handleUserPress} />
        )}
        ListEmptyComponent={renderEmpty}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2E2E2E",
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#424242",
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: "#F4F4F4",
    fontSize: 15,
  },
  clearButton: {
    padding: 4,
  },
  centerContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 12,
  },
  emptyText: {
    color: "#A1A1AA",
    fontSize: 14,
  },
});

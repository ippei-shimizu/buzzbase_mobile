import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import { MemberRow } from "@components/groups/MemberRow";
import { useDeleteGroup } from "@hooks/useGroupMutations";
import { useGroupMembers } from "@hooks/useGroups";
import { useProfile } from "@hooks/useProfile";

export default function MembersScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const groupId = id ? Number(id) : undefined;
  const { data, isLoading, refetch, isRefreshing } = useGroupMembers(groupId);
  const { profile } = useProfile();
  const { deleteGroup, isDeleting } = useDeleteGroup();

  const isCreator =
    data && profile ? data.group_creator_id === profile.id : false;

  const handleInvite = () => {
    router.push(`/(groups)/invite?id=${id}`);
  };

  const handleEdit = () => {
    router.push(`/(groups)/edit?id=${id}`);
  };

  const handleDelete = () => {
    if (!groupId) return;

    Alert.alert("グループを削除", "この操作は取り消せません。削除しますか？", [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteGroup(groupId);
            router.dismissAll();
          } catch {
            Alert.alert("エラー", "グループの削除に失敗しました");
          }
        },
      },
    ]);
  };

  if (isLoading || !data) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#d08000" />
      </View>
    );
  }

  return (
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
      <View style={styles.memberList}>
        {data.accepted_users.map((user) => (
          <MemberRow
            key={user.id}
            user={user}
            isCreator={user.id === data.group_creator_id}
          />
        ))}
      </View>

      <TouchableOpacity style={styles.inviteButton} onPress={handleInvite}>
        <Text style={styles.inviteButtonText}>メンバーを招待</Text>
      </TouchableOpacity>

      {isCreator && (
        <View style={styles.creatorActions}>
          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <Text style={styles.editButtonText}>グループを編集</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            disabled={isDeleting}
          >
            <Text style={styles.deleteButtonText}>
              {isDeleting ? "削除中..." : "グループを削除"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
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
  memberList: {
    marginBottom: 16,
  },
  inviteButton: {
    backgroundColor: "#d08000",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginBottom: 16,
  },
  inviteButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  creatorActions: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#424242",
    paddingTop: 16,
  },
  editButton: {
    borderWidth: 1,
    borderColor: "#d08000",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  editButtonText: {
    color: "#d08000",
    fontSize: 16,
    fontWeight: "600",
  },
  deleteButton: {
    borderWidth: 1,
    borderColor: "#EF4444",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#EF4444",
    fontSize: 16,
    fontWeight: "600",
  },
});

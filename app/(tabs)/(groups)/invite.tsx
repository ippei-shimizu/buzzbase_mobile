import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState, useMemo } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import { SelectableUserRow } from "@components/groups/SelectableUserRow";
import { useInviteMembers } from "@hooks/useGroupMutations";
import { useFollowingUsers, useGroupMembers } from "@hooks/useGroups";
import { useProfile } from "@hooks/useProfile";

export default function InviteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const groupId = id ? Number(id) : undefined;
  const { profile } = useProfile();
  const { users, isLoading: isLoadingUsers } = useFollowingUsers(profile?.id);
  const { data: membersData, isLoading: isLoadingMembers } =
    useGroupMembers(groupId);
  const { inviteMembers, isInviting } = useInviteMembers();

  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);

  const existingMemberIds = useMemo(() => {
    if (!membersData) return new Set<number>();
    return new Set(membersData.accepted_users.map((u) => u.id));
  }, [membersData]);

  const handleToggleUser = (userId: number) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const handleInvite = async () => {
    if (!groupId || selectedUserIds.length === 0) return;

    try {
      await inviteMembers({ id: groupId, userIds: selectedUserIds });
      router.back();
    } catch {
      Alert.alert("エラー", "招待の送信に失敗しました");
    }
  };

  const isLoading = isLoadingUsers || isLoadingMembers;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#d08000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        {users.length === 0 ? (
          <Text style={styles.emptyText}>フォロー中のユーザーがいません</Text>
        ) : (
          users.map((user) => {
            const isMember = existingMemberIds.has(user.id);
            return (
              <SelectableUserRow
                key={user.id}
                user={user}
                selected={isMember || selectedUserIds.includes(user.id)}
                disabled={isMember}
                onToggle={handleToggleUser}
              />
            );
          })
        )}
      </ScrollView>

      {selectedUserIds.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.inviteButton,
              isInviting && styles.inviteButtonDisabled,
            ]}
            onPress={handleInvite}
            disabled={isInviting}
          >
            {isInviting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.inviteButtonText}>
                {selectedUserIds.length}人を招待
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2E2E2E",
  },
  scrollView: {
    flex: 1,
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
  emptyText: {
    color: "#A1A1AA",
    fontSize: 16,
    textAlign: "center",
    marginTop: 32,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#424242",
  },
  inviteButton: {
    backgroundColor: "#d08000",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
  },
  inviteButtonDisabled: {
    opacity: 0.5,
  },
  inviteButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

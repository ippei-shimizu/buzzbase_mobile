import * as ImagePicker from "expo-image-picker";
import { useRouter, Stack } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  Alert,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { GroupForm } from "@components/groups/GroupForm";
import { SelectableUserRow } from "@components/groups/SelectableUserRow";
import { useCreateGroup, useInviteMembers } from "@hooks/useGroupMutations";
import { useFollowingUsers } from "@hooks/useGroups";
import { useProfile } from "@hooks/useProfile";

export default function GroupCreateScreen() {
  const router = useRouter();
  const { profile } = useProfile();
  const { users, isLoading: isLoadingUsers } = useFollowingUsers(profile?.id);
  const { createGroup, isCreating } = useCreateGroup();
  const { inviteMembers, isInviting } = useInviteMembers();

  const [name, setName] = useState("");
  const [iconUri, setIconUri] = useState<string | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);

  const isSaving = isCreating || isInviting;
  const canSave = name.trim().length > 0 && !isSaving;

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setIconUri(result.assets[0].uri);
    }
  };

  const handleToggleUser = (userId: number) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("group[name]", name);

      if (iconUri) {
        const filename = iconUri.split("/").pop() ?? "icon.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image/jpeg";
        formData.append("group[icon]", {
          uri: iconUri,
          name: filename,
          type,
        } as unknown as Blob);
      }

      const group = await createGroup(formData);

      if (selectedUserIds.length > 0) {
        await inviteMembers({ id: group.id, userIds: selectedUserIds });
      }

      router.replace(`/(groups)/share-invite?id=${group.id}`);
    } catch {
      Alert.alert("エラー", "グループの作成に失敗しました");
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <TouchableOpacity
              style={[
                styles.headerSaveButton,
                !canSave && styles.headerSaveButtonDisabled,
              ]}
              onPress={handleSave}
              disabled={!canSave}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.headerSaveButtonText}>作成</Text>
              )}
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <GroupForm
          name={name}
          iconUri={iconUri}
          onChangeName={setName}
          onPickImage={handlePickImage}
        />

        <View style={styles.inviteSection}>
          <Text style={styles.inviteTitle}>メンバーを選択</Text>
          <Text style={styles.inviteDescription}>
            フォローしているユーザーのみ招待可能{"\n"}
            アプリ未登録の人は作成後に招待コードで招待できます
          </Text>
          {isLoadingUsers ? (
            <ActivityIndicator
              size="small"
              color="#d08000"
              style={styles.loader}
            />
          ) : (
            users.map((user) => (
              <SelectableUserRow
                key={user.id}
                user={user}
                selected={selectedUserIds.includes(user.id)}
                onToggle={handleToggleUser}
              />
            ))
          )}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2E2E2E",
  },
  headerSaveButton: {
    backgroundColor: "#d08000",
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  headerSaveButtonDisabled: {
    opacity: 0.5,
  },
  headerSaveButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  inviteSection: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  inviteTitle: {
    color: "#F4F4F4",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  inviteDescription: {
    color: "#A1A1AA",
    fontSize: 13,
    marginBottom: 12,
  },
  loader: {
    marginTop: 16,
  },
});

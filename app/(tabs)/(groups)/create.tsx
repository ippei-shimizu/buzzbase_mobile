import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useProfile } from "@hooks/useProfile";
import { useFollowingUsers } from "@hooks/useGroups";
import { useCreateGroup, useInviteMembers } from "@hooks/useGroupMutations";
import { GroupForm } from "@components/groups/GroupForm";
import { SelectableUserRow } from "@components/groups/SelectableUserRow";

export default function GroupCreateScreen() {
  const router = useRouter();
  const { profile } = useProfile();
  const { users, isLoading: isLoadingUsers } = useFollowingUsers(profile?.id);
  const { createGroup, isCreating } = useCreateGroup();
  const { inviteMembers, isInviting } = useInviteMembers();

  const [name, setName] = useState("");
  const [iconUri, setIconUri] = useState<string | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);

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

      router.back();
    } catch {
      Alert.alert("エラー", "グループの作成に失敗しました");
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <GroupForm
        name={name}
        iconUri={iconUri}
        isSaving={isCreating || isInviting}
        onChangeName={setName}
        onPickImage={handlePickImage}
        onSave={handleSave}
        saveLabel="作成"
      />

      <View style={styles.inviteSection}>
        <Text style={styles.inviteTitle}>メンバーを招待（任意）</Text>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2E2E2E",
  },
  inviteSection: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  inviteTitle: {
    color: "#F4F4F4",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  loader: {
    marginTop: 16,
  },
});

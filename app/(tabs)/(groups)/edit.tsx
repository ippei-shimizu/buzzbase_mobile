import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  Alert,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { GroupForm } from "@components/groups/GroupForm";
import { useUpdateGroupInfo } from "@hooks/useGroupMutations";
import { useGroupDetail } from "@hooks/useGroups";

export default function GroupEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const groupId = id ? Number(id) : undefined;
  const { data, isLoading } = useGroupDetail(groupId);
  const { updateGroupInfo, isUpdating } = useUpdateGroupInfo();

  const [name, setName] = useState("");
  const [iconUri, setIconUri] = useState<string | null>(null);
  const [iconChanged, setIconChanged] = useState(false);

  useEffect(() => {
    if (data?.group) {
      setName(data.group.name);
      setIconUri(data.group.icon?.url ?? null);
    }
  }, [data]);

  const canSave = name.trim().length > 0 && !isUpdating;

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setIconUri(result.assets[0].uri);
      setIconChanged(true);
    }
  };

  const handleSave = async () => {
    if (!groupId) return;

    try {
      const formData = new FormData();
      formData.append("group[name]", name);

      if (iconChanged && iconUri) {
        const filename = iconUri.split("/").pop() ?? "icon.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image/jpeg";
        formData.append("group[icon]", {
          uri: iconUri,
          name: filename,
          type,
        } as unknown as Blob);
      }

      await updateGroupInfo({ id: groupId, formData });
      router.back();
    } catch {
      Alert.alert("エラー", "グループの更新に失敗しました");
    }
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
            <TouchableOpacity
              style={[
                styles.headerSaveButton,
                !canSave && styles.headerSaveButtonDisabled,
              ]}
              onPress={handleSave}
              disabled={!canSave}
            >
              {isUpdating ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.headerSaveButtonText}>保存</Text>
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
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2E2E2E",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
});

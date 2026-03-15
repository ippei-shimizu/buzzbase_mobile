import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useGroupDetail } from "@hooks/useGroups";
import { useUpdateGroupInfo } from "@hooks/useGroupMutations";
import { GroupForm } from "@components/groups/GroupForm";

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
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <GroupForm
        name={name}
        iconUri={iconUri}
        isSaving={isUpdating}
        onChangeName={setName}
        onPickImage={handlePickImage}
        onSave={handleSave}
      />
    </ScrollView>
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
});

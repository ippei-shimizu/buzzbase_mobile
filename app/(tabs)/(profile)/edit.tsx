import React, { useState, useEffect } from "react";
import {
  ScrollView,
  Alert,
  StyleSheet,
  ActivityIndicator,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useProfile } from "@hooks/useProfile";
import { useProfileEdit } from "@hooks/useProfileEdit";
import { useAuthStore } from "@stores/authStore";
import { ProfileEditForm } from "@components/profile/ProfileEditForm";

export default function ProfileEditScreen() {
  const router = useRouter();
  const { profile, isLoading } = useProfile();
  const { updateProfile, isUpdating } = useProfileEdit();
  const logout = useAuthStore((s) => s.logout);

  const [name, setName] = useState("");
  const [userId, setUserId] = useState("");
  const [introduction, setIntroduction] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageChanged, setImageChanged] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? "");
      setUserId(profile.user_id ?? "");
      setIntroduction(profile.introduction ?? "");
      setIsPrivate(profile.is_private);
      setImageUri(profile.image?.url ?? null);
    }
  }, [profile]);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      setImageChanged(true);
    }
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("user[name]", name);
      formData.append("user[user_id]", userId);
      formData.append("user[introduction]", introduction);
      formData.append("user[is_private]", String(isPrivate));

      if (imageChanged && imageUri) {
        const filename = imageUri.split("/").pop() ?? "photo.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image/jpeg";
        formData.append("user[image]", {
          uri: imageUri,
          name: filename,
          type,
        } as unknown as Blob);
      }

      await updateProfile(formData);
      router.back();
    } catch {
      Alert.alert("エラー", "プロフィールの更新に失敗しました");
    }
  };

  const handleLogout = () => {
    Alert.alert("ログアウト", "ログアウトしますか？", [
      { text: "キャンセル", style: "cancel" },
      {
        text: "ログアウト",
        style: "destructive",
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#d08000" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
      <ProfileEditForm
        name={name}
        userId={userId}
        introduction={introduction}
        isPrivate={isPrivate}
        imageUri={imageUri}
        isUpdating={isUpdating}
        onChangeName={setName}
        onChangeUserId={setUserId}
        onChangeIntroduction={setIntroduction}
        onChangeIsPrivate={setIsPrivate}
        onPickImage={handlePickImage}
        onSave={handleSave}
        onLogout={handleLogout}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2E2E2E",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#2E2E2E",
  },
});

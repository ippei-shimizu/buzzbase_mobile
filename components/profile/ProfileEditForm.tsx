import React from "react";
import {
  View,
  Text,
  TextInput,
  Switch,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

interface ProfileEditFormProps {
  name: string;
  userId: string;
  introduction: string;
  isPrivate: boolean;
  imageUri: string | null;
  isUpdating: boolean;
  onChangeName: (value: string) => void;
  onChangeUserId: (value: string) => void;
  onChangeIntroduction: (value: string) => void;
  onChangeIsPrivate: (value: boolean) => void;
  onPickImage: () => void;
  onSave: () => void;
  onLogout: () => void;
}

export const ProfileEditForm = ({
  name,
  userId,
  introduction,
  isPrivate,
  imageUri,
  isUpdating,
  onChangeName,
  onChangeUserId,
  onChangeIntroduction,
  onChangeIsPrivate,
  onPickImage,
  onSave,
  onLogout,
}: ProfileEditFormProps) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.avatarContainer} onPress={onPickImage}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.placeholder]}>
            <Text style={styles.placeholderText}>+</Text>
          </View>
        )}
        <Text style={styles.changePhotoText}>写真を変更</Text>
      </TouchableOpacity>

      <View style={styles.field}>
        <Text style={styles.label}>名前</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={onChangeName}
          placeholder="名前を入力"
          placeholderTextColor="#71717A"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>ユーザーID</Text>
        <View style={styles.userIdContainer}>
          <Text style={styles.atSign}>@</Text>
          <TextInput
            style={[styles.input, styles.userIdInput]}
            value={userId}
            onChangeText={onChangeUserId}
            placeholder="user_id"
            placeholderTextColor="#71717A"
            autoCapitalize="none"
          />
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>自己紹介</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={introduction}
          onChangeText={onChangeIntroduction}
          placeholder="自己紹介を入力（100文字以内）"
          placeholderTextColor="#71717A"
          multiline
          maxLength={100}
        />
        <Text style={styles.charCount}>{introduction.length}/100</Text>
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.label}>非公開アカウント</Text>
        <Switch
          value={isPrivate}
          onValueChange={onChangeIsPrivate}
          trackColor={{ false: "#525252", true: "#d08000" }}
          thumbColor="#F4F4F4"
        />
      </View>

      <TouchableOpacity
        style={[styles.saveButton, isUpdating && styles.saveButtonDisabled]}
        onPress={onSave}
        disabled={isUpdating}
      >
        {isUpdating ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.saveButtonText}>保存</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
        <Text style={styles.logoutButtonText}>ログアウト</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  placeholder: {
    backgroundColor: "#424242",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: "#d08000",
    fontSize: 28,
    fontWeight: "700",
  },
  changePhotoText: {
    color: "#d08000",
    fontSize: 14,
    marginTop: 8,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    color: "#A1A1AA",
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#424242",
    borderRadius: 8,
    padding: 12,
    color: "#F4F4F4",
    fontSize: 16,
  },
  userIdContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  atSign: {
    color: "#A1A1AA",
    fontSize: 16,
    marginRight: 4,
  },
  userIdInput: {
    flex: 1,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  charCount: {
    color: "#71717A",
    fontSize: 12,
    textAlign: "right",
    marginTop: 4,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
  },
  saveButton: {
    backgroundColor: "#d08000",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginBottom: 16,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: "#EF4444",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginBottom: 40,
  },
  logoutButtonText: {
    color: "#EF4444",
    fontSize: 16,
    fontWeight: "600",
  },
});

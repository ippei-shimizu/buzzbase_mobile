import React from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

interface GroupFormProps {
  name: string;
  iconUri: string | null;
  isSaving: boolean;
  onChangeName: (name: string) => void;
  onPickImage: () => void;
  onSave: () => void;
  saveLabel?: string;
}

export const GroupForm = ({
  name,
  iconUri,
  isSaving,
  onChangeName,
  onPickImage,
  onSave,
  saveLabel = "保存",
}: GroupFormProps) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.iconPicker} onPress={onPickImage}>
        {iconUri ? (
          <Image source={{ uri: iconUri }} style={styles.icon} />
        ) : (
          <View style={[styles.icon, styles.iconPlaceholder]}>
            <Text style={styles.iconPlaceholderText}>+</Text>
          </View>
        )}
        <Text style={styles.iconLabel}>アイコンを変更</Text>
      </TouchableOpacity>

      <Text style={styles.label}>グループ名</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={onChangeName}
        placeholder="グループ名を入力"
        placeholderTextColor="#71717A"
        maxLength={50}
      />

      <TouchableOpacity
        style={[
          styles.saveButton,
          (!name.trim() || isSaving) && styles.saveButtonDisabled,
        ]}
        onPress={onSave}
        disabled={!name.trim() || isSaving}
      >
        {isSaving ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.saveButtonText}>{saveLabel}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  iconPicker: {
    alignItems: "center",
    marginBottom: 24,
  },
  icon: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  iconPlaceholder: {
    backgroundColor: "#4A4A4A",
    alignItems: "center",
    justifyContent: "center",
  },
  iconPlaceholderText: {
    color: "#A1A1AA",
    fontSize: 32,
  },
  iconLabel: {
    color: "#d08000",
    fontSize: 14,
    marginTop: 8,
  },
  label: {
    color: "#A1A1AA",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#3A3A3A",
    borderRadius: 8,
    padding: 12,
    color: "#F4F4F4",
    fontSize: 16,
    marginBottom: 24,
  },
  saveButton: {
    backgroundColor: "#d08000",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

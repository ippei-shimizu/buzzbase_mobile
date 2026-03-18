import React from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { GroupDefaultIcon } from "@components/icon/GroupDefaultIcon";

interface GroupFormProps {
  name: string;
  iconUri: string | null;
  onChangeName: (name: string) => void;
  onPickImage: () => void;
}

export const GroupForm = ({
  name,
  iconUri,
  onChangeName,
  onPickImage,
}: GroupFormProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>グループ設定</Text>
      <View style={styles.row}>
        <TouchableOpacity onPress={onPickImage} style={styles.iconPicker}>
          {iconUri && !iconUri.endsWith(".svg") && iconUri.length > 0 ? (
            <Image source={{ uri: iconUri }} style={styles.icon} />
          ) : (
            <GroupDefaultIcon size={56} />
          )}
          <Text style={styles.iconLabel}>アイコン設定</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={onChangeName}
          placeholder="グループ名"
          placeholderTextColor="#71717A"
          maxLength={50}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  sectionTitle: {
    color: "#F4F4F4",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
  },
  iconPicker: {
    alignItems: "center",
  },
  icon: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  iconLabel: {
    color: "#d08000",
    fontSize: 11,
    marginTop: 4,
  },
  input: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#52525B",
    paddingVertical: 10,
    color: "#F4F4F4",
    fontSize: 16,
    marginTop: 12,
  },
});

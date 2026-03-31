import type { FollowingUser } from "../../types/group";
import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { DefaultUserIcon } from "@components/ui/DefaultUserIcon";
import { API_BASE_URL } from "@constants/api";

interface SelectableUserRowProps {
  user: FollowingUser;
  selected: boolean;
  disabled?: boolean;
  onToggle: (userId: number) => void;
}

export const SelectableUserRow = ({
  user,
  selected,
  disabled,
  onToggle,
}: SelectableUserRowProps) => {
  return (
    <TouchableOpacity
      style={[styles.row, disabled && styles.rowDisabled]}
      onPress={() => !disabled && onToggle(user.id)}
      activeOpacity={disabled ? 1 : 0.7}
    >
      {user.image?.url &&
      !user.image.url.endsWith(".svg") &&
      user.image.url.length > 0 ? (
        <Image
          source={{
            uri: user.image.url.startsWith("http")
              ? user.image.url
              : `${API_BASE_URL}${user.image.url}`,
          }}
          style={styles.avatar}
        />
      ) : (
        <View style={styles.avatarWrapper}>
          <DefaultUserIcon size={40} />
        </View>
      )}
      <View style={styles.info}>
        <Text
          style={[styles.name, disabled && styles.textDisabled]}
          numberOfLines={1}
        >
          {user.name}
        </Text>
        <Text style={styles.userId}>@{user.user_id}</Text>
      </View>
      <View
        style={[
          styles.checkbox,
          selected && styles.checkboxSelected,
          disabled && styles.checkboxDisabled,
        ]}
      >
        {selected && <Text style={styles.checkmark}>✓</Text>}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#424242",
  },
  rowDisabled: {
    opacity: 0.5,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  avatarWrapper: {
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    color: "#F4F4F4",
    fontSize: 15,
    fontWeight: "500",
  },
  textDisabled: {
    color: "#71717A",
  },
  userId: {
    color: "#A1A1AA",
    fontSize: 13,
    marginTop: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#71717A",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  checkboxSelected: {
    backgroundColor: "#d08000",
    borderColor: "#d08000",
  },
  checkboxDisabled: {
    borderColor: "#4A4A4A",
    backgroundColor: "#3A3A3A",
  },
  checkmark: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});

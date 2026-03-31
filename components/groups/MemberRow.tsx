import type { GroupUser } from "../../types/group";
import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { DefaultUserIcon } from "@components/ui/DefaultUserIcon";
import { API_BASE_URL } from "@constants/api";

interface MemberRowProps {
  user: GroupUser;
  isCreator?: boolean;
}

export const MemberRow = ({ user, isCreator }: MemberRowProps) => {
  return (
    <View style={styles.row}>
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
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {user.name}
          </Text>
          {isCreator && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>作成者</Text>
            </View>
          )}
        </View>
        <Text style={styles.userId}>@{user.user_id}</Text>
      </View>
    </View>
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
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  name: {
    color: "#F4F4F4",
    fontSize: 15,
    fontWeight: "500",
    flexShrink: 1,
  },
  badge: {
    backgroundColor: "#d08000",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
  userId: {
    color: "#A1A1AA",
    fontSize: 13,
    marginTop: 1,
  },
});

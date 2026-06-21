import React from "react";
import { View, StyleSheet } from "react-native";
import { GroupIcon } from "./GroupIcon";

interface Props {
  size?: number;
  color?: string;
  showBadge?: boolean;
}

/**
 * グループタブ用アイコン。未参加ユーザーへの誘導として右上に赤ポチを重ねる。
 */
export const GroupTabIcon = ({ size, color, showBadge }: Props) => (
  <View>
    <GroupIcon size={size} color={color} />
    {showBadge && (
      <View
        style={styles.badge}
        accessibilityLabel="未参加グループの通知"
        accessibilityRole="image"
      />
    )}
  </View>
);

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
  },
});

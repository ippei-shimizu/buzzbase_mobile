import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import type { FollowStatus } from "../../types/profile";

interface FollowButtonProps {
  followStatus: FollowStatus;
  onPress: () => void;
  isLoading: boolean;
}

export const FollowButton = ({
  followStatus,
  onPress,
  isLoading,
}: FollowButtonProps) => {
  if (followStatus === "self") return null;

  const isFilled = followStatus === "none";

  const label =
    followStatus === "none"
      ? "フォローする"
      : followStatus === "following"
        ? "フォロー中"
        : "リクエスト済み";

  return (
    <TouchableOpacity
      style={[styles.button, isFilled ? styles.filled : styles.outlined]}
      onPress={onPress}
      disabled={isLoading}
      activeOpacity={0.7}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={isFilled ? "#FFFFFF" : "#A1A1AA"}
        />
      ) : (
        <Text
          style={[
            styles.label,
            isFilled ? styles.filledLabel : styles.outlinedLabel,
          ]}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
    minWidth: 120,
    alignItems: "center",
    justifyContent: "center",
    height: 36,
  },
  filled: {
    backgroundColor: "#d08000",
  },
  outlined: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#424242",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
  filledLabel: {
    color: "#FFFFFF",
  },
  outlinedLabel: {
    color: "#A1A1AA",
  },
});

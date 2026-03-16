import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { UserProfile, FollowStatus } from "../../types/profile";
import { FollowCounts } from "./FollowCounts";
import { FollowButton } from "./FollowButton";
import { DefaultUserIcon } from "@components/ui/DefaultUserIcon";
import { GloveIcon } from "@components/ui/icons/GloveIcon";
import { BallIcon } from "@components/ui/icons/BallIcon";
import { CrownIcon } from "@components/ui/icons/CrownIcon";
import { LockIcon } from "@components/ui/icons/LockIcon";
import { API_BASE_URL } from "@constants/api";

interface ProfileHeaderProps {
  profile: UserProfile;
  followingCount?: number;
  followersCount?: number;
  followStatus?: FollowStatus;
  onFollowPress?: () => void;
  onFollowingCountPress?: () => void;
  onFollowersCountPress?: () => void;
  isFollowLoading?: boolean;
  positions?: { id: number; name: string }[];
  teamName?: string;
  categoryName?: string;
  prefectureName?: string;
  awards?: { id: number; title: string }[];
  showEditButton?: boolean;
  onEditPress?: () => void;
  onSharePress?: () => void;
}

export const ProfileHeader = ({
  profile,
  followingCount,
  followersCount,
  followStatus,
  onFollowPress,
  onFollowingCountPress,
  onFollowersCountPress,
  isFollowLoading,
  positions,
  teamName,
  categoryName,
  prefectureName,
  awards,
  showEditButton,
  onEditPress,
  onSharePress,
}: ProfileHeaderProps) => {
  const hasPositions = positions && positions.length > 0;
  const hasTeam = !!teamName;
  const hasAwards = awards && awards.length > 0;

  return (
    <View style={styles.container}>
      {/* アバター + 名前 横並び */}
      <View style={styles.topRow}>
        {profile.image?.url && !profile.image.url.endsWith(".svg") ? (
          <Image
            source={{
              uri: profile.image.url.startsWith("http")
                ? profile.image.url
                : `${API_BASE_URL}${profile.image.url}`,
            }}
            style={styles.avatar}
          />
        ) : (
          <DefaultUserIcon size={60} />
        )}
        <View style={styles.nameSection}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {profile.name ?? "未設定"}
            </Text>
            {profile.is_private && (
              <LockIcon width={14} height={14} fill="#A1A1AA" />
            )}
          </View>
          {profile.user_id && (
            <Text style={styles.userId}>@{profile.user_id}</Text>
          )}
        </View>
      </View>

      {/* 自己紹介 */}
      {profile.introduction && (
        <Text style={styles.introduction}>{profile.introduction}</Text>
      )}

      {/* ポジション */}
      {hasPositions && (
        <View style={styles.infoRow}>
          <GloveIcon width={13} height={16} fill="#A1A1AA" />
          <Text style={styles.infoText}>
            {positions.map((p) => p.name).join(" / ")}
          </Text>
        </View>
      )}

      {/* チーム */}
      {hasTeam && (
        <View style={styles.infoRow}>
          <BallIcon width={14} height={15} fill="#A1A1AA" />
          <Text style={styles.infoText}>
            {teamName}
            {categoryName ? `（${categoryName}）` : ""}
            {prefectureName ? ` | ${prefectureName}` : ""}
          </Text>
        </View>
      )}

      {/* 受賞歴 */}
      {hasAwards && (
        <View style={styles.infoRow}>
          <CrownIcon width={16} height={16} fill="#d08000" />
          <Text style={styles.awardText}>
            {awards.map((a) => a.title).join("  ")}
          </Text>
        </View>
      )}

      {/* フォロー数 */}
      {followingCount != null && followersCount != null && (
        <FollowCounts
          followingCount={followingCount}
          followersCount={followersCount}
          onFollowingPress={onFollowingCountPress ?? (() => {})}
          onFollowersPress={onFollowersCountPress ?? (() => {})}
        />
      )}

      {/* プロフィール編集 + シェアボタン（自分のページのみ） */}
      {showEditButton && (
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.editButton} onPress={onEditPress}>
            <Text style={styles.editButtonText}>プロフィール編集</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton} onPress={onSharePress}>
            <Ionicons name="share-outline" size={16} color="#F4F4F4" />
            <Text style={styles.shareButtonText}>シェアする</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* フォローボタン（他ユーザーのみ） */}
      {followStatus && followStatus !== "self" && onFollowPress && (
        <View style={styles.followButtonContainer}>
          <FollowButton
            followStatus={followStatus}
            onPress={onFollowPress}
            isLoading={isFollowLoading ?? false}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  nameSection: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  name: {
    color: "#F4F4F4",
    fontSize: 18,
    fontWeight: "700",
    flexShrink: 1,
  },
  userId: {
    color: "#A1A1AA",
    fontSize: 13,
    marginTop: 2,
  },
  introduction: {
    color: "#D4D4D8",
    fontSize: 13,
    marginTop: 10,
    lineHeight: 19,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  infoText: {
    color: "#A1A1AA",
    fontSize: 13,
    flex: 1,
  },
  awardText: {
    color: "#d08000",
    fontSize: 13,
    flex: 1,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  editButton: {
    flex: 1,
    backgroundColor: "#424242",
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
  },
  editButtonText: {
    color: "#F4F4F4",
    fontSize: 13,
    fontWeight: "600",
  },
  shareButton: {
    flex: 1,
    backgroundColor: "#424242",
    borderRadius: 8,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  shareButtonText: {
    color: "#F4F4F4",
    fontSize: 13,
    fontWeight: "600",
  },
  followButtonContainer: {
    marginTop: 14,
  },
});

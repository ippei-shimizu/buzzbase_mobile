import type { InviteLinkInfo } from "../../../types/group";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { GroupDefaultIcon } from "@components/icon/GroupDefaultIcon";
import { DefaultUserIcon } from "@components/ui/DefaultUserIcon";
import { API_BASE_URL } from "@constants/api";
import { useAcceptInviteLink } from "@hooks/useGroupMutations";
import { getInviteLinkInfo } from "@services/groupService";

export default function JoinGroupScreen() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [inviteInfo, setInviteInfo] = useState<InviteLinkInfo | null>(null);
  const { acceptInviteLink, isAccepting } = useAcceptInviteLink();

  const handleLookup = async () => {
    if (code.length === 0) return;

    setIsLookingUp(true);
    try {
      const info = await getInviteLinkInfo(code);
      setInviteInfo(info);
    } catch {
      Alert.alert("エラー", "無効な招待コードです");
      setInviteInfo(null);
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleJoin = async () => {
    try {
      const result = await acceptInviteLink(code);
      router.replace(`/(groups)/${result.group_id}`);
    } catch {
      Alert.alert("エラー", "グループへの参加に失敗しました");
    }
  };

  const groupIconUrl = inviteInfo?.group.icon;
  const hasValidGroupIcon =
    groupIconUrl && !groupIconUrl.endsWith(".svg") && groupIconUrl.length > 0;

  const inviterImageUrl = inviteInfo?.inviter.image?.url;
  const hasValidInviterImage =
    inviterImageUrl &&
    !inviterImageUrl.endsWith(".svg") &&
    inviterImageUrl.length > 0;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>招待コードを入力</Text>
      <TextInput
        style={styles.input}
        value={code}
        onChangeText={(text) => setCode(text.toUpperCase())}
        placeholder="例: ABC12DEF"
        placeholderTextColor="#52525b"
        autoCapitalize="characters"
        autoCorrect={false}
        maxLength={8}
      />

      <TouchableOpacity
        style={[
          styles.lookupButton,
          code.length === 0 && styles.buttonDisabled,
        ]}
        onPress={handleLookup}
        disabled={code.length === 0 || isLookingUp}
      >
        {isLookingUp ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.lookupButtonText}>確認する</Text>
        )}
      </TouchableOpacity>

      {inviteInfo && (
        <View style={styles.previewCard}>
          <View style={styles.groupRow}>
            {hasValidGroupIcon ? (
              <Image
                source={{
                  uri: groupIconUrl.startsWith("http")
                    ? groupIconUrl
                    : `${API_BASE_URL}${groupIconUrl}`,
                }}
                style={styles.groupIcon}
              />
            ) : (
              <GroupDefaultIcon size={48} />
            )}
            <View style={styles.groupInfo}>
              <Text style={styles.groupName}>{inviteInfo.group.name}</Text>
              <Text style={styles.memberCount}>
                メンバー: {inviteInfo.group.member_count}人
              </Text>
            </View>
          </View>

          <View style={styles.inviterRow}>
            {hasValidInviterImage ? (
              <Image
                source={{
                  uri: inviterImageUrl!.startsWith("http")
                    ? inviterImageUrl!
                    : `${API_BASE_URL}${inviterImageUrl!}`,
                }}
                style={styles.inviterIcon}
              />
            ) : (
              <DefaultUserIcon size={24} />
            )}
            <Text style={styles.inviterName}>
              招待者: {inviteInfo.inviter.name}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.joinButton}
            onPress={handleJoin}
            disabled={isAccepting}
          >
            {isAccepting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.joinButtonText}>グループに参加</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2E2E2E",
    padding: 24,
  },
  label: {
    color: "#F4F4F4",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#27272a",
    borderRadius: 8,
    padding: 14,
    color: "#F4F4F4",
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 2,
    textAlign: "center",
    marginBottom: 16,
  },
  lookupButton: {
    backgroundColor: "#52525b",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginBottom: 24,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  lookupButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  previewCard: {
    backgroundColor: "#27272a",
    borderRadius: 12,
    padding: 20,
  },
  groupRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 16,
  },
  groupIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    color: "#F4F4F4",
    fontSize: 18,
    fontWeight: "700",
  },
  memberCount: {
    color: "#A1A1AA",
    fontSize: 13,
    marginTop: 2,
  },
  inviterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#3f3f46",
  },
  inviterIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  inviterName: {
    color: "#A1A1AA",
    fontSize: 14,
  },
  joinButton: {
    backgroundColor: "#d08000",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
  },
  joinButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});

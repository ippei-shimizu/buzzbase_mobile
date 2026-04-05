import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Share,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useGetOrCreateInviteLink } from "@hooks/useGroupMutations";

const APP_STORE_URL = "https://apps.apple.com/jp/app/buzz-base/id6761011816";

export default function ShareInviteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const groupId = id ? Number(id) : undefined;
  const { getOrCreateInviteLink, isPending, data } = useGetOrCreateInviteLink();

  const fetchInviteLink = useCallback(() => {
    if (groupId) {
      getOrCreateInviteLink(groupId);
    }
  }, [groupId, getOrCreateInviteLink]);

  useEffect(() => {
    fetchInviteLink();
  }, [fetchInviteLink]);

  const handleCopy = async () => {
    if (data?.code) {
      await Clipboard.setStringAsync(data.code);
    }
  };

  const handleShare = async () => {
    if (!data) return;

    const message = `BUZZ BASEで「${data.group_name}」に参加しよう！\n\n招待コード: ${data.code}\n\nアプリをダウンロード\n${APP_STORE_URL}\n\nアプリをインストールして、招待コードを入力してね！`;

    await Share.share({ message });
  };

  if (isPending || !data) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#d08000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.groupName}>{data.group_name}</Text>

      <View style={styles.codeCard}>
        <Text style={styles.codeLabel}>招待コード</Text>
        <Text style={styles.code}>{data.code}</Text>
      </View>

      <TouchableOpacity style={styles.copyButton} onPress={handleCopy}>
        <Ionicons name="copy-outline" size={18} color="#d08000" />
        <Text style={styles.copyButtonText}>コードをコピー</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
        <Ionicons name="share-outline" size={18} color="#FFFFFF" />
        <Text style={styles.shareButtonText}>LINEなどで共有</Text>
      </TouchableOpacity>

      <Text style={styles.description}>
        コードを受け取った人はアプリで入力して{"\n"}グループに参加できます
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2E2E2E",
    padding: 24,
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2E2E2E",
  },
  groupName: {
    color: "#F4F4F4",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 24,
    marginBottom: 32,
  },
  codeCard: {
    backgroundColor: "#27272a",
    borderRadius: 16,
    paddingVertical: 28,
    paddingHorizontal: 40,
    alignItems: "center",
    width: "100%",
    marginBottom: 24,
  },
  codeLabel: {
    color: "#A1A1AA",
    fontSize: 13,
    marginBottom: 8,
  },
  code: {
    color: "#d08000",
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: 4,
  },
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#d08000",
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: "100%",
    justifyContent: "center",
    marginBottom: 12,
  },
  copyButtonText: {
    color: "#d08000",
    fontSize: 16,
    fontWeight: "600",
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#d08000",
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: "100%",
    justifyContent: "center",
    marginBottom: 32,
  },
  shareButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  description: {
    color: "#71717A",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },
});

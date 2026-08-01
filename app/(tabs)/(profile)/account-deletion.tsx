import { Ionicons } from "@expo/vector-icons";
import { isAxiosError } from "axios";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useAuth } from "@hooks/useAuth";
import { deleteAccount } from "@services/profileService";

export default function AccountDeletionScreen() {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const { logout } = useAuth();

  const handleDelete = () => {
    Alert.alert(
      "アカウント削除",
      "この操作は取り消せません。すべてのデータが完全に削除されます。本当に削除しますか？",
      [
        { text: "キャンセル", style: "cancel" },
        {
          text: "削除する",
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            try {
              await deleteAccount();
              await logout();
            } catch (error) {
              setIsDeleting(false);
              // back は Pro 加入中の削除を 422 + error: "pro_active" でブロックする。
              // 汎用エラーにせず、解約導線付きの専用ダイアログを出す。
              const code = isAxiosError(error)
                ? (error.response?.data as { error?: string } | undefined)
                    ?.error
                : null;
              if (code === "pro_active") {
                Alert.alert(
                  "削除できません",
                  "Pro 加入中のため、先に解約してください。",
                  [
                    { text: "キャンセル", style: "cancel" },
                    {
                      text: "解約する",
                      onPress: () => router.push("/account/subscription"),
                    },
                  ],
                );
                return;
              }
              Alert.alert("エラー", "アカウントの削除に失敗しました");
            }
          },
        },
      ],
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.warningCard}>
          <Ionicons name="warning-outline" size={48} color="#EF4444" />
          <Text style={styles.warningTitle}>アカウントを削除しますか？</Text>
          <Text style={styles.warningText}>
            アカウントを削除すると、以下のデータがすべて完全に削除され、復元できなくなります。
          </Text>
        </View>

        <View style={styles.listCard}>
          {[
            "プロフィール情報",
            "試合結果・成績データ",
            "野球ノート",
            "シーズン情報",
            "フォロー・フォロワー関係",
            "グループ参加情報",
            "その他すべての関連データ",
          ].map((item) => (
            <View key={item} style={styles.listItem}>
              <Ionicons name="close-circle" size={18} color="#EF4444" />
              <Text style={styles.listItemText}>{item}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.deleteButton,
            isDeleting && styles.deleteButtonDisabled,
          ]}
          onPress={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.deleteButtonText}>アカウントを削除する</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2E2E2E",
  },
  content: {
    padding: 16,
    gap: 20,
  },
  warningCard: {
    backgroundColor: "#27272a",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    gap: 12,
  },
  warningTitle: {
    color: "#F4F4F4",
    fontSize: 18,
    fontWeight: "700",
  },
  warningText: {
    color: "#A1A1AA",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },
  listCard: {
    backgroundColor: "#27272a",
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  listItemText: {
    color: "#F4F4F4",
    fontSize: 14,
  },
  deleteButton: {
    backgroundColor: "#EF4444",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  deleteButtonDisabled: {
    opacity: 0.6,
  },
  deleteButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});

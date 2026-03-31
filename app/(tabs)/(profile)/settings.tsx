import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
} from "react-native";
import { useAuthStore } from "@stores/authStore";

interface SettingsItem {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  onPress: () => void;
  destructive?: boolean;
}

export default function SettingsScreen() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    Alert.alert("ログアウト", "ログアウトしますか？", [
      { text: "キャンセル", style: "cancel" },
      {
        text: "ログアウト",
        style: "destructive",
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const items: SettingsItem[] = [
    {
      icon: "person-outline",
      title: "プロフィール編集",
      description: "名前・自己紹介・チーム・ポジションを変更",
      onPress: () => router.push("/(profile)/edit"),
    },
    {
      icon: "shield-outline",
      title: "プライバシーポリシー",
      description: "個人情報の取り扱いについて",
      onPress: () => router.push("/(profile)/privacy-policy"),
    },
    {
      icon: "document-text-outline",
      title: "利用規約",
      description: "サービスの利用条件について",
      onPress: () => router.push("/(profile)/terms-of-service"),
    },
    {
      icon: "log-out-outline",
      title: "ログアウト",
      description: "アカウントからログアウト",
      onPress: handleLogout,
      destructive: true,
    },
    {
      icon: "trash-outline",
      title: "アカウント削除",
      description: "アカウントとすべてのデータを完全に削除",
      onPress: () => router.push("/(profile)/account-deletion"),
      destructive: true,
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.list}>
        {items.map((item, index) => (
          <React.Fragment key={item.title}>
            <TouchableOpacity style={styles.item} onPress={item.onPress}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name={item.icon}
                  size={22}
                  color={item.destructive ? "#EF4444" : "#F4F4F4"}
                />
              </View>
              <View style={styles.textContainer}>
                <Text
                  style={[
                    styles.title,
                    item.destructive && styles.destructiveText,
                  ]}
                >
                  {item.title}
                </Text>
                <Text style={styles.description}>{item.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#71717A" />
            </TouchableOpacity>
            {index < items.length - 1 && <View style={styles.divider} />}
          </React.Fragment>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2E2E2E",
  },
  list: {
    marginTop: 16,
    marginHorizontal: 16,
    backgroundColor: "#27272a",
    borderRadius: 12,
    overflow: "hidden",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 14,
  },
  iconContainer: {
    width: 32,
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: "#F4F4F4",
    fontSize: 15,
    fontWeight: "600",
  },
  destructiveText: {
    color: "#EF4444",
  },
  description: {
    color: "#71717A",
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#3A3A3A",
    marginHorizontal: 16,
  },
});

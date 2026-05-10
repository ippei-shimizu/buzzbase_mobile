import Constants from "expo-constants";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { DangerActionButton } from "@components/profile/DangerActionButton";
import {
  SettingsSection,
  type SettingsItem,
} from "@components/profile/SettingsSection";
import { useStoreReview } from "@hooks/useStoreReview";
import { useAuthStore } from "@stores/authStore";

interface SettingsSectionData {
  title: string;
  items: SettingsItem[];
}

/**
 * 設定画面（ルートレベル配置）。
 *
 * `app/_layout.tsx` の Stack の直下に配置されているため、各タブ（ダッシュボード /
 * 試合結果 / 成績 / グループ / マイページ）から `router.push("/settings")` で
 * push すると、その時点のタブの履歴の上に積まれる。戻るボタンで遷移元のタブに戻る。
 *
 * サブ画面（プロフィール編集・お問い合わせ等）は引き続き `(profile)` 配下に
 * あり、そちらに遷移するとプロフィールタブへジャンプする（現状仕様）。
 */
export default function SettingsScreen() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const { openStoreReviewPage } = useStoreReview();

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

  const sections: SettingsSectionData[] = [
    {
      title: "アカウント",
      items: [
        {
          icon: "person-outline",
          title: "プロフィール編集",
          description:
            "アカウントの公開設定・名前・チーム・ポジションなどを変更",
          onPress: () => router.push("/(profile)/edit"),
        },
      ],
    },
    {
      title: "ヘルプ",
      items: [
        {
          icon: "calculator-outline",
          title: "成績の算出方法",
          description: "打率・防御率などの計算方法について",
          onPress: () => router.push("/(profile)/calculation-of-grades"),
        },
      ],
    },
    {
      title: "その他",
      items: [
        {
          icon: "star-outline",
          title: "レビューで応援する",
          description: "ストアでレビューを貰えると泣いて喜びます",
          onPress: () => {
            void openStoreReviewPage();
          },
        },
        {
          icon: "mail-outline",
          title: "お問い合わせ",
          description: "ご意見・不具合の報告など",
          onPress: () => router.push("/(profile)/contact"),
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
      ],
    },
  ];

  const version = Constants.expoConfig?.version ?? "";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {sections.map((section) => (
        <SettingsSection
          key={section.title}
          title={section.title}
          items={section.items}
        />
      ))}

      <View style={styles.dangerZone}>
        <DangerActionButton
          label="ログアウト"
          variant="filled"
          onPress={handleLogout}
        />
        <DangerActionButton
          label="アカウント削除"
          variant="outline"
          onPress={() => router.push("/(profile)/account-deletion")}
          style={styles.outlineSpacing}
        />
        {version ? (
          <Text style={styles.version}>バージョン {version}</Text>
        ) : null}
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
    paddingBottom: 48,
  },
  dangerZone: {
    marginTop: 40,
    paddingHorizontal: 16,
  },
  outlineSpacing: {
    marginTop: 12,
  },
  version: {
    color: "#71717A",
    fontSize: 13,
    textAlign: "center",
    marginTop: 16,
  },
});
